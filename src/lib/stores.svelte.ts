import { type DiaryEntry, type UserPreferences, defaultPreferences, generateId, normalizeDate, sortDiaryEntries } from './types';
import * as drive from './driveHelper';

const ENTRIES_KEY = 'tally-diary-entries';
const PREFS_KEY = 'tally-diary-preferences';

// ─── localStorage helpers ──────────────────────────────

function loadEntries(): DiaryEntry[] {
	if (typeof window === 'undefined') return [];
	try {
		const data = localStorage.getItem(ENTRIES_KEY);
		if (data) {
			const entries = JSON.parse(data) as DiaryEntry[];
			// Backfill IDs and repair legacy date formats, persisting once if anything changed
			let changed = false;
			for (const e of entries) {
				if (!e.id) { e.id = generateId(); changed = true; }
				const norm = normalizeDate(e.date || '');
				if (norm !== e.date) { e.date = norm; changed = true; }
			}
			entries.sort(sortDiaryEntries);
			if (changed) localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
			return entries;
		}
	} catch (e) {
		console.error('Error loading entries:', e);
	}
	return [];
}

function loadPreferences(): UserPreferences {
	if (typeof window === 'undefined') return { ...defaultPreferences };
	try {
		const data = localStorage.getItem(PREFS_KEY);
		if (data) return JSON.parse(data) as UserPreferences;
	} catch (e) {
		console.error('Error loading preferences:', e);
	}
	return { ...defaultPreferences };
}

function saveEntries(entries: DiaryEntry[]) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

function savePreferences(prefs: UserPreferences) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ─── Drive async helpers (fire-and-forget) ──────────────

// Debounce map for batch uploads
const uploadTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function triggerBatchUpload(batchId: string, getEntries: () => DiaryEntry[]) {
	const token = drive.getToken();
	if (!token) return;

	if (uploadTimers[batchId]) {
		clearTimeout(uploadTimers[batchId]);
	}

	uploadTimers[batchId] = setTimeout(() => {
		const allEntries = getEntries();
		const batchEntries = allEntries.filter(e => e.batchId === batchId);
		
		drive.writeBatch(batchId, batchEntries, token).then((ok) => {
			if (ok) console.log(`[Drive] Synced batch: ${batchId} (${batchEntries.length} entries)`);
		}).catch(err => console.warn(`[Drive] Sync batch ${batchId} failed:`, err));
		
		delete uploadTimers[batchId];
	}, 200); // 200ms debounce to prevent aborted uploads on quick app exit
}

function driveWritePreferences(prefs: UserPreferences) {
	const token = drive.getToken();
	if (!token) return;

	drive.writePreferences(prefs, token).then(() => {
		console.log('[Drive] Preferences saved');
	}).catch(err => console.warn('[Drive] Write prefs failed:', err));
}

// ─── Store ──────────────────────────────────────────────

function createDiaryStore() {
	let entries = $state<DiaryEntry[]>(loadEntries());
	let preferences = $state<UserPreferences>(loadPreferences());
	let signedIn = $state(false);
	let syncing = $state(false);

	/** Fetch remote entries, merge with local (local wins on conflict), persist. Returns remote count. */
	async function mergeRemoteEntries(token: string): Promise<number> {
		const driveEntries = await drive.loadAllEntries(token);
		const combined = new Map<string, DiaryEntry>();
		for (const raw of driveEntries) {
			const e: DiaryEntry = { ...raw, id: raw.id || generateId(), date: normalizeDate(raw.date || '') };
			combined.set(e.id, e);
		}
		for (const e of entries) combined.set(e.id, e);
		entries = Array.from(combined.values()).sort(sortDiaryEntries);
		saveEntries(entries);
		return driveEntries.length;
	}

	function getOpenBatchId(): string {
		const counts: Record<string, number> = {};
		for (const e of entries) {
			if (e.batchId) counts[e.batchId] = (counts[e.batchId] || 0) + 1;
		}
		// Find an existing batch with space
		for (const [id, count] of Object.entries(counts)) {
			if (count < 100) return id;
		}
		// Or create a new one
		return `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
	}

	return {
		get entries() { return entries; },
		set entries(val: DiaryEntry[]) { entries = val; saveEntries(val); },

		get preferences() { return preferences; },
		set preferences(val: UserPreferences) { preferences = val; savePreferences(val); },

		get signedIn() { return signedIn; },
		get syncing() { return syncing; },

		/** Sign in with Google and sync from Drive. */
		async signIn(): Promise<boolean> {
			try {
				const token = await drive.authenticate();
				if (!token) return false;
				signedIn = true;
				await this.syncFromDrive();
				return true;
			} catch (e) {
				console.warn('[Store] Sign-in failed:', e);
				return false;
			}
		},

		/**
		 * Try to silently re-authenticate on app load.
		 * No popup shown — only works for returning users who previously granted consent.
		 * Returns true if successfully re-authenticated and synced.
		 */
		async trySilentSignIn(): Promise<boolean> {
			try {
				const token = await drive.trySilentAuth();
				if (!token) return false;
				signedIn = true;
				await this.syncFromDrive();
				console.log('[Store] Silent re-auth successful, synced from Drive');
				return true;
			} catch (e) {
				console.warn('[Store] Silent re-auth failed:', e);
				return false;
			}
		},

		/** Sign out of Google Drive. Local data remains. */
		async signOut() {
			await drive.signOut();
			signedIn = false;
		},

		/** Pull all entries from Drive and replace local data. */
		async syncFromDrive() {
			const token = drive.getToken();
			if (!token) return;

			syncing = true;
			try {
				const remoteCount = await mergeRemoteEntries(token);
				if (remoteCount > 0) {
					console.log(`[Drive] Synced ${entries.length} entries from Drive`);
				} else {
					// If drive has 0 batched files but local has entries without batchId, it means migration hasn't run yet.
					console.log(`[Drive] No batch files found. (Migration will handle any legacy formats).`);
				}

				// Load preferences from Drive
				const drivePrefs = await drive.readPreferences(token);
				if (drivePrefs) {
					preferences = { ...defaultPreferences, ...drivePrefs };
					savePreferences(preferences);
					console.log('[Drive] Synced preferences from Drive');
				}
			} catch (e) {
				console.warn('[Drive] Sync failed:', e);
			} finally {
				syncing = false;
			}
		},

		/** Merge local UI and Drive, then FORCE upload all local states back to Drive to fix out-of-sync devices */
		async forceSync() {
			const token = drive.getToken();
			if (!token) return false;
			syncing = true;
			try {
				await mergeRemoteEntries(token);

				// Re-upload all batches to ensure Drive exactly matches our newly merged local state
				const batches: Record<string, DiaryEntry[]> = {};
				for (const e of entries) {
					if (!e.batchId) e.batchId = getOpenBatchId();
					if (!batches[e.batchId]) batches[e.batchId] = [];
					batches[e.batchId].push(e);
				}
				
				for (const [bId, arr] of Object.entries(batches)) {
					await drive.writeBatch(bId, arr, token);
				}
				console.log(`[Drive] Force Sync complete! ${entries.length} total entries.`);
				return true;
			} catch (e) {
				console.warn('[Drive] Force Sync failed:', e);
				return false;
			} finally {
				syncing = false;
			}
		},

		addEntry(entry: DiaryEntry) {
			if (!entry.id) entry.id = generateId();
			if (!entry.batchId) entry.batchId = getOpenBatchId();
			entries.push(entry);
			entries.sort(sortDiaryEntries);
			saveEntries(entries);
			triggerBatchUpload(entry.batchId, () => entries);
		},

		updateEntry(index: number, entry: DiaryEntry) {
			if (index >= 0 && index < entries.length) {
				const existing = entries[index];
				// Preserve IDs
				if (!entry.id && existing.id) entry.id = existing.id;
				
				// Ensure it has a batchId
				if (!entry.batchId) {
					entry.batchId = existing.batchId || getOpenBatchId();
				}
				
				entries[index] = entry;
				entries.sort(sortDiaryEntries);
				saveEntries(entries);
				triggerBatchUpload(entry.batchId, () => entries);
			}
		},

		deleteEntry(index: number) {
			if (index >= 0 && index < entries.length) {
				const removed = entries[index];
				entries.splice(index, 1);
				saveEntries(entries);
				if (removed.batchId) {
					triggerBatchUpload(removed.batchId, () => entries);
				}
			}
		},

		updatePreferences(prefs: Partial<UserPreferences>) {
			preferences = { ...preferences, ...prefs };
			savePreferences(preferences);
			driveWritePreferences(preferences);
		},

		exportData(): string {
			return JSON.stringify(entries, null, 2);
		},

		importData(json: string) {
			try {
				const imported = JSON.parse(json) as DiaryEntry[];
				// Merge by id, local wins — same convention as the Drive sync merge
				const existingIds = new Set(entries.map(e => e.id));
				imported.forEach(entry => {
					if (!entry.id) entry.id = generateId();
					entry.date = normalizeDate(entry.date || '');
					if (existingIds.has(entry.id)) return;
					existingIds.add(entry.id);
					if (!entry.batchId) entry.batchId = getOpenBatchId();
					entries.push(entry);
					triggerBatchUpload(entry.batchId, () => entries);
				});
				entries.sort(sortDiaryEntries);
				saveEntries(entries);
				return true;
			} catch {
				return false;
			}
		},

		async deleteAllData() {
			const token = drive.getToken();
			if (token) {
				// Wipe everything the app has ever written to appDataFolder:
				// batch files, preferences, and legacy files
				try {
					const files = await drive.listAllFiles(token);
					for (let i = 0; i < files.length; i += 10) {
						await Promise.all(files.slice(i, i + 10).map(f => drive.deleteFile(f.id, token)));
					}
				} catch (e) {
					console.warn('[Store] Drive wipe failed:', e);
				}
			}
			entries = [];
			preferences = { ...defaultPreferences };
			saveEntries(entries);
			savePreferences(preferences);
		}
	};
}

export const store = createDiaryStore();
