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
	fileName?: string;
	index?: number;
}

export interface UserPreferences {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	primaryTheme: 'light' | 'dark';
	secondaryColor: string;
	usePassword: boolean;
	password: string;
	appLaunches: number;
}

export const defaultPreferences: UserPreferences = {
	firstName: '',
	lastName: '',
	dateOfBirth: '2000-01-01',
	primaryTheme: 'dark',
	secondaryColor: 'blue',
	usePassword: false,
	password: '',
	appLaunches: 0,
};

/** Generate a unique ID for diary entries */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

