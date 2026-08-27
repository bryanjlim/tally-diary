import { Utensils, Zap, MapPin, User, Tag } from 'lucide-svelte';

export const TALLY_CATEGORIES = ['Food', 'Activity', 'Location', 'Person', 'Other'] as const;
export type TallyCategory = typeof TALLY_CATEGORIES[number];

export interface TallyMark {
	type: TallyCategory;
	text: string;
}

export interface DiaryEntry {
	id: string;
	title: string;
	date: string;
	bodyText: string;
	tallies: TallyMark[];
	isThumbUp: boolean;
	isThumbDown: boolean;
	entryNumber: number;
	batchId?: string;
}

export interface UserPreferences {
	dateOfBirth: string;
	primaryTheme: 'light' | 'dark';
}

export const defaultPreferences: UserPreferences = {
	dateOfBirth: '2000-01-01',
	primaryTheme: 'dark',
};

/** Tally chip styling shared across entry pages and the timeline. */
export const categoryColors: Record<TallyCategory, string> = {
	Food: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
	Activity: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
	Location: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
	Person: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
	Other: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

/** Icon per tally category, shown on chips and category pickers. */
export const categoryIcons: Record<TallyCategory, typeof Tag> = {
	Food: Utensils,
	Activity: Zap,
	Location: MapPin,
	Person: User,
	Other: Tag,
};

/** Helper to get category color safely */
export function getCategoryColor(type?: string): string {
	if (!type) return categoryColors.Other;
	return categoryColors[type as TallyCategory] || categoryColors.Other;
}

/** Helper to get category icon safely */
export function getCategoryIcon(type?: string): typeof Tag {
	if (!type) return Tag;
	return categoryIcons[type as TallyCategory] || Tag;
}

/** Sanitize and guarantee a valid UserPreferences object */
export function sanitizePreferences(raw: any): UserPreferences {
	if (!raw || typeof raw !== 'object') return { ...defaultPreferences };
	const dob = typeof raw.dateOfBirth === 'string' && raw.dateOfBirth.trim() ? raw.dateOfBirth.trim() : defaultPreferences.dateOfBirth;
	const themeRaw = String(raw.primaryTheme || '').toLowerCase();
	const primaryTheme: 'light' | 'dark' = themeRaw === 'light' ? 'light' : 'dark';
	return {
		dateOfBirth: dob,
		primaryTheme,
	};
}

/** Sanitize and guarantee a valid DiaryEntry object */
export function sanitizeEntry(raw: any): DiaryEntry {
	if (!raw || typeof raw !== 'object') {
		return {
			id: generateId(),
			title: '',
			date: normalizeDate(''),
			bodyText: '',
			tallies: [],
			isThumbUp: false,
			isThumbDown: false,
			entryNumber: 0
		};
	}

	const tallies: TallyMark[] = [];
	if (Array.isArray(raw.tallies)) {
		for (const t of raw.tallies) {
			if (t && typeof t === 'object' && typeof t.text === 'string' && t.text.trim()) {
				const rawType = String(t.type || '').trim();
				const capitalized = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
				const type: TallyCategory = TALLY_CATEGORIES.includes(capitalized as TallyCategory)
					? (capitalized as TallyCategory)
					: (TALLY_CATEGORIES.includes(rawType as TallyCategory) ? (rawType as TallyCategory) : 'Other');
				tallies.push({ type, text: t.text.trim() });
			}
		}
	}

	return {
		id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : generateId(),
		title: typeof raw.title === 'string' ? raw.title : (typeof raw.customTitle === 'string' ? raw.customTitle : ''),
		date: normalizeDate(typeof raw.date === 'string' ? raw.date : ''),
		bodyText: typeof raw.bodyText === 'string' ? raw.bodyText : '',
		tallies,
		isThumbUp: Boolean(raw.isThumbUp),
		isThumbDown: Boolean(raw.isThumbDown),
		entryNumber: typeof raw.entryNumber === 'number' && !isNaN(raw.entryNumber) ? raw.entryNumber : 0,
		batchId: typeof raw.batchId === 'string' && raw.batchId.trim() ? raw.batchId.trim() : undefined,
	};
}

/** Generate a unique ID for diary entries */
export function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Normalize any parseable date string to local YYYY-MM-DD.
 * Legacy app data carries dates in other formats (e.g. "6/15/2019");
 * everything downstream (heatmap keys, month grouping, daysAlive) assumes ISO.
 * Unparseable strings are returned unchanged.
 */
export function normalizeDate(s: string): string {
	if (!s) {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	}
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
	if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
	const d = new Date(s);
	if (isNaN(d.getTime())) return s;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "Day N" counter: days between date of birth and the entry date, inclusive. */
export function daysAlive(date: string, dob?: string): number {
	const birth = dob || defaultPreferences.dateOfBirth;
	if (!birth || !date) return 1;
	const diff = new Date(date + 'T12:00:00').getTime() - new Date(birth + 'T12:00:00').getTime();
	if (isNaN(diff)) return 1;
	return Math.round(diff / 86400000) + 1;
}

export function sortDiaryEntries(a: DiaryEntry, b: DiaryEntry): number {
	const aDate = a?.date || '';
	const bDate = b?.date || '';
	const bTime = new Date(bDate).getTime();
	const aTime = new Date(aDate).getTime();
	const timeDiff = bTime - aTime;
	if (timeDiff !== 0 && !isNaN(timeDiff)) return timeDiff;

	if (b?.entryNumber !== undefined && a?.entryNumber !== undefined && b.entryNumber !== a.entryNumber) {
		return b.entryNumber - a.entryNumber;
	}
	if (b?.id && a?.id) return b.id.localeCompare(a.id);
	return 0;
}
