/**
 * One-time migration from old Tally Diary format to the new batched format.
 *
 * KEEP: no metrics on how many clients still run the old app, so this must
 * stay shipped indefinitely — do not delete in cleanup passes.
 *
 * Migration is split into two phases:
 *   Phase 1: Read old data from Drive (file "1") → save to localStorage
 *   Phase 2: Chunk entries into 100-entry batches and upload to Drive.
 *            Also cleans up any old single "entry_" files from previous attempts.
 */

import * as drive from './driveHelper';
import { TALLY_CATEGORIES, type DiaryEntry, type TallyMark, type TallyCategory, generateId, normalizeDate, sortDiaryEntries } from './types';
import { store } from './stores.svelte';

const MIGRATION_KEY = 'tally-diary-migration-batch-done';
const MIGRATION_PHASE1_KEY = 'tally-diary-migration-phase1-done';
const MIGRATION_PROGRESS_KEY = 'tally-diary-migration-batch-progress';
const ENTRIES_KEY = 'tally-diary-entries';

// ─── Helpers ────────────────────────────────────────────

function normalizeTally(raw: any): TallyMark | null {
	if (!raw || typeof raw !== 'object') return null;
	const type = raw.type as string;
	const text = raw.text as string;
	if (!type || !text) return null;
	const validType = TALLY_CATEGORIES.includes(type as TallyCategory) ? type as TallyCategory : 'Other';
	return { type: validType, text };
}

function convertEntry(raw: any): DiaryEntry {
	const tallies: TallyMark[] = [];
	if (Array.isArray(raw.tallies)) {
		for (const t of raw.tallies) {
			const normalized = normalizeTally(t);
			if (normalized) tallies.push(normalized);
		}
	}

	return {
		id: generateId(),
		title: raw.title || raw.customTitle || '',
		date: normalizeDate(raw.date || ''),
		bodyText: raw.bodyText || '',
		tallies,
		isThumbUp: !!raw.isThumbUp,
		isThumbDown: !!raw.isThumbDown,
		entryNumber: raw.entryNumber || 0,
	};
}

function getProgress(): number {
	const val = localStorage.getItem(MIGRATION_PROGRESS_KEY);
	return val ? parseInt(val, 10) : 0;
}

function setProgress(n: number) {
	localStorage.setItem(MIGRATION_PROGRESS_KEY, String(n));
}

// ─── Phase 1: Read old data → localStorage ─────────────

function isPhase1Done(): boolean {
	return !!localStorage.getItem(MIGRATION_PHASE1_KEY);
}

function shouldRunPhase1(): boolean {
	if (typeof window === 'undefined') return false;
	if (localStorage.getItem(MIGRATION_KEY)) return false;
	if (isPhase1Done()) return false;
	if (store.entries.length > 0) return false;
	return true;
}

async function runPhase1(token: string): Promise<number> {
	const existingFiles = await drive.listBatchFiles(token);
	if (existingFiles.length > 0) {
		// Already securely migrated to batched format — skip
		localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
		return 0;
	}

	let entriesImported = 0;
	const oldEntries = await drive.readOldEntries(token);
	if (oldEntries && oldEntries.length > 0) {
		const converted = oldEntries.map(raw => convertEntry(raw));
		const existing = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]') as DiaryEntry[];
		const all = [...existing, ...converted];
		all.sort(sortDiaryEntries);
		localStorage.setItem(ENTRIES_KEY, JSON.stringify(all));
		entriesImported = converted.length;
		store.entries = all;
	}

	const oldPrefs = await drive.readOldPreferences(token);
	if (oldPrefs && oldPrefs.dateOfBirth) {
		store.updatePreferences({
			dateOfBirth: oldPrefs.dateOfBirth,
			primaryTheme: oldPrefs.primaryTheme === 'light' ? 'light' : 'dark',
		});
	}

	localStorage.setItem(MIGRATION_PHASE1_KEY, new Date().toISOString());
	console.log(`[Migration] Phase 1 complete: ${entriesImported} entries loaded to localStorage`);
	return entriesImported;
}

// ─── Phase 2: Assign batch IDs and upload ─────────────

function isPhase2Done(): boolean {
	return !!localStorage.getItem(MIGRATION_KEY);
}

async function runPhase2(token: string): Promise<{ completed: number; total: number } | null> {
	if (isPhase2Done()) return null;

	const entries = store.entries;
	
	// Pre-cleanup: delete any old "entry_" files that might have been created by previous single-file code
	try {
	    await drive.deleteAllSingleEntryFiles(token);
	    console.log('[Migration] Cleaned up obsolete single "entry_" files.');
	} catch (e) {
	    console.warn('[Migration] Issue during cleanup of single "entry_" files', e);
	}

	if (entries.length === 0) {
		localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
		return { completed: 0, total: 0 };
	}

	// 1. Assign a persistent `batchId` to any entry missing one.
	// We want ~100 entries per batch.
	let modified = false;
	const batchBuckets: Record<string, DiaryEntry[]> = {};
	
	let unbatchedGroup: DiaryEntry[] = [];
	let batchCounter = 0;
	
	for (const e of entries) {
		if (e.batchId) {
			if (!batchBuckets[e.batchId]) batchBuckets[e.batchId] = [];
			batchBuckets[e.batchId].push(e);
		} else {
			unbatchedGroup.push(e);
		}
	}

	// Pack unbatched entries into 100s
	for (const e of unbatchedGroup) {
		const assignedId = `migrated_${batchCounter}`;
		e.batchId = assignedId;
		if (!batchBuckets[assignedId]) batchBuckets[assignedId] = [];
		batchBuckets[assignedId].push(e);
		modified = true;
		
		if (batchBuckets[assignedId].length >= 100) {
			batchCounter++;
		}
	}

	if (modified) {
		store.entries = entries; // Persist assignments to local storage
	}

	// 2. Upload batches to Drive incrementally
	const batchIdsToUpload = Object.keys(batchBuckets);
	const totalBatches = batchIdsToUpload.length;
	let progress = getProgress();

	console.log(`[Migration] Phase 2: uploading batches to Drive (${progress}/${totalBatches} done)`);

	while (progress < totalBatches) {
		const batchId = batchIdsToUpload[progress];
		const batchArray = batchBuckets[batchId];

		try {
			await drive.writeBatch(batchId, batchArray, token);
			progress++;
			setProgress(progress);
			console.log(`[Migration] Phase 2 progress: ${progress}/${totalBatches} batches uploaded`);
		} catch (err) {
			console.warn(`[Migration] Failed to upload batch ${batchId}:`, err);
			return { completed: progress * 100, total: totalBatches * 100 }; // Halt and resume later
		}
	}

	try {
		await drive.writePreferences(store.preferences, token);
	} catch {
		// Non-critical
	}

	localStorage.removeItem(MIGRATION_PROGRESS_KEY);
	localStorage.removeItem(MIGRATION_PHASE1_KEY);
	localStorage.setItem(MIGRATION_KEY, new Date().toISOString());

	console.log(`[Migration] Phase 2 complete. All entries synced.`);
	return { completed: entries.length, total: entries.length };
}

// ─── Public API ────────────────────────────────────────

export async function trySilentMigration(): Promise<{ entries: number; prefs: boolean } | null> {
	const token = drive.getToken();
	if (!token) return null;

	if (localStorage.getItem(MIGRATION_KEY)) return null;

	try {
		let entriesImported = 0;
		if (shouldRunPhase1()) {
			entriesImported = await runPhase1(token);
		}

		const phase2Result = await runPhase2(token);

		if (entriesImported > 0 || phase2Result) {
			console.log(`[Migration] Migration complete`);
			return { entries: entriesImported, prefs: true };
		}
		return null;
	} catch (e) {
		console.warn('[Migration] Error:', e);
		return null;
	}
}
