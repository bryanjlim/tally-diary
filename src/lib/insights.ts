import { daysAlive, type DiaryEntry, type TallyCategory } from './types';

const DAY_MS = 86400000;

export function todayLocal(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const time = (s: string) => new Date(s + 'T12:00:00').getTime();
const daysBetween = (a: string, b: string) => Math.round((time(a) - time(b)) / DAY_MS);

// ─── Streaks ───────────────────────────────────────────

export function streaks(entries: DiaryEntry[]): { current: number; longest: number } {
	const days = [...new Set(entries.map((e) => e.date))].sort();
	let longest = 0;
	let run = 0;
	for (let i = 0; i < days.length; i++) {
		run = i > 0 && daysBetween(days[i], days[i - 1]) === 1 ? run + 1 : 1;
		if (run > longest) longest = run;
	}
	let current = 0;
	if (days.length && daysBetween(todayLocal(), days[days.length - 1]) <= 1) {
		current = 1;
		for (let i = days.length - 1; i > 0 && daysBetween(days[i], days[i - 1]) === 1; i--) current++;
	}
	return { current, longest };
}

// ─── Good days ─────────────────────────────────────────

export interface GoodDayStats {
	rated: number;
	pctGood: number;
	bestMonth: { label: string; pct: number } | null;
}

const monthLabel = (ym: string) =>
	new Date(ym + '-15T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export function goodDayStats(entries: DiaryEntry[]): GoodDayStats | null {
	const rated = entries.filter((e) => e.isThumbUp || e.isThumbDown);
	if (!rated.length) return null;
	const pctGood = Math.round((100 * rated.filter((e) => e.isThumbUp).length) / rated.length);

	const byMonth = new Map<string, { up: number; total: number }>();
	for (const e of rated) {
		const key = e.date.slice(0, 7);
		const m = byMonth.get(key) ?? { up: 0, total: 0 };
		m.total++;
		if (e.isThumbUp) m.up++;
		byMonth.set(key, m);
	}
	let bestMonth: GoodDayStats['bestMonth'] = null;
	for (const [key, m] of byMonth) {
		if (m.total < 3) continue;
		const pct = Math.round((100 * m.up) / m.total);
		if (!bestMonth || pct > bestMonth.pct) bestMonth = { label: monthLabel(key), pct };
	}
	return { rated: rated.length, pctGood, bestMonth };
}

// ─── Good-day correlations ─────────────────────────────

export interface Correlation {
	text: string;
	type: TallyCategory;
	pct: number;
	count: number;
	baseline: number;
}

/** Which tallies show up disproportionately on thumbs-up days. Correlation, not causation. */
export function goodDayCorrelations(entries: DiaryEntry[]): Correlation[] {
	const rated = entries.filter((e) => e.isThumbUp || e.isThumbDown);
	if (rated.length < 10) return [];
	const baseline = Math.round((100 * rated.filter((e) => e.isThumbUp).length) / rated.length);

	const byTally = new Map<string, { type: TallyCategory; up: number; total: number }>();
	for (const e of rated) {
		const seen = new Set<string>();
		for (const t of e.tallies) {
			if (seen.has(t.text)) continue;
			seen.add(t.text);
			const s = byTally.get(t.text) ?? { type: t.type, up: 0, total: 0 };
			s.total++;
			if (e.isThumbUp) s.up++;
			byTally.set(t.text, s);
		}
	}
	const out: Correlation[] = [];
	for (const [text, s] of byTally) {
		if (s.total < 4) continue; // too few rated occurrences to be meaningful
		out.push({ text, type: s.type, pct: Math.round((100 * s.up) / s.total), count: s.total, baseline });
	}
	return out.sort((a, b) => b.pct - a.pct).slice(0, 5);
}

// ─── Tally trends ──────────────────────────────────────

export interface Mover {
	text: string;
	type: TallyCategory;
	cur: number;
	prev: number;
}
export interface Lapsed {
	text: string;
	type: TallyCategory;
	count: number;
	daysAgo: number;
}

export function tallyTrends(entries: DiaryEntry[]): { movers: Mover[]; lapsed: Lapsed[] } {
	const today = todayLocal();
	const cur = new Map<string, number>();
	const prev = new Map<string, number>();
	const totals = new Map<string, { type: TallyCategory; count: number }>();
	const lastSeen = new Map<string, number>();

	for (const e of entries) {
		const age = daysBetween(today, e.date);
		for (const t of e.tallies) {
			const total = totals.get(t.text) ?? { type: t.type, count: 0 };
			total.count++;
			totals.set(t.text, total);
			const seen = lastSeen.get(t.text);
			if (seen === undefined || age < seen) lastSeen.set(t.text, age);
			if (age >= 0 && age < 30) cur.set(t.text, (cur.get(t.text) ?? 0) + 1);
			else if (age >= 30 && age < 60) prev.set(t.text, (prev.get(t.text) ?? 0) + 1);
		}
	}

	const movers: Mover[] = [];
	for (const [text, info] of totals) {
		const c = cur.get(text) ?? 0;
		const p = prev.get(text) ?? 0;
		if (c + p >= 3 && c !== p) movers.push({ text, type: info.type, cur: c, prev: p });
	}
	movers.sort((a, b) => Math.abs(b.cur - b.prev) - Math.abs(a.cur - a.prev));

	const lapsed: Lapsed[] = [];
	for (const [text, info] of totals) {
		const daysAgo = lastSeen.get(text) ?? 0;
		if (info.count >= 3 && daysAgo > 21) lapsed.push({ text, type: info.type, count: info.count, daysAgo });
	}
	lapsed.sort((a, b) => b.count - a.count);

	return { movers: movers.slice(0, 5), lapsed: lapsed.slice(0, 3) };
}

// ─── On this day ───────────────────────────────────────

export interface Anniversary {
	index: number;
	title: string;
	yearsAgo: number;
	date: string;
}

export function onThisDay(entries: DiaryEntry[]): Anniversary[] {
	const today = todayLocal();
	const [ty, tm, td] = today.split('-');
	const out: Anniversary[] = [];
	entries.forEach((e, index) => {
		const [y, m, d] = (e.date || '').split('-');
		if (m === tm && d === td && y < ty) {
			out.push({ index, title: e.title || e.date, yearsAgo: Number(ty) - Number(y), date: e.date });
		}
	});
	return out.sort((a, b) => a.yearsAgo - b.yearsAgo);
}

// ─── Milestones ────────────────────────────────────────

export function milestones(entries: DiaryEntry[], dob: string): string[] {
	const out: string[] = [];
	if (dob) {
		const dayN = daysAlive(todayLocal(), dob);
		const next = Math.ceil((dayN + 1) / 500) * 500;
		out.push(`Day ${next.toLocaleString()} is in ${next - dayN} days`);
	}
	const n = entries.length;
	if (n > 0) {
		const next = Math.ceil((n + 1) / 100) * 100;
		out.push(`${next - n} entries until your ${next.toLocaleString()}th`);
	}
	let top: { text: string; count: number } | null = null;
	const counts = new Map<string, number>();
	for (const e of entries) for (const t of e.tallies) counts.set(t.text, (counts.get(t.text) ?? 0) + 1);
	for (const [text, count] of counts) if (!top || count > top.count) top = { text, count };
	if (top && top.count >= 10) {
		const next = Math.ceil((top.count + 1) / 50) * 50;
		out.push(`${next - top.count} more "${top.text}" tallies until number ${next}`);
	}
	return out;
}

// ─── Writing stats ─────────────────────────────────────

export function writingStats(entries: DiaryEntry[]): { total: number; avg: number; longest: number } {
	let total = 0;
	let longest = 0;
	for (const e of entries) {
		const words = e.bodyText?.trim() ? e.bodyText.trim().split(/\s+/).length : 0;
		total += words;
		if (words > longest) longest = words;
	}
	return { total, avg: entries.length ? Math.round(total / entries.length) : 0, longest };
}
