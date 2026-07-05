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

/** Generate a unique ID for diary entries */
export function generateId(): string {
	return crypto.randomUUID();
}

/** "Day N" counter: days between date of birth and the entry date, inclusive. */
export function daysAlive(date: string, dob: string): number {
	if (!dob) return 0;
	const diff = new Date(date + 'T12:00:00').getTime() - new Date(dob + 'T12:00:00').getTime();
	return Math.round(diff / 86400000) + 1;
}

export function sortDiaryEntries(a: DiaryEntry, b: DiaryEntry): number {
	const bTime = new Date(b.date).getTime();
	const aTime = new Date(a.date).getTime();
	const timeDiff = bTime - aTime;
	if (timeDiff !== 0 && !isNaN(timeDiff)) return timeDiff;

	if (b.entryNumber !== undefined && a.entryNumber !== undefined && b.entryNumber !== a.entryNumber) {
		return b.entryNumber - a.entryNumber;
	}
	if (b.id && a.id) return b.id.localeCompare(a.id);
	return 0;
}
