<script lang="ts">
	// GitHub-style year grid: one cell per day for the past 365 days.
	// mode 'mood':   0 no entry, 1 entry, 2 bad day, 3 good day
	// mode 'length': 0 no entry, 1-4 words-per-day bucket relative to the busiest day
	import type { DiaryEntry } from './types';

	// year: null = rolling past 365 days; a number = that calendar year (Jan 1 – Dec 31)
	let { entries, mode = 'mood', year = null }: { entries: DiaryEntry[]; mode?: 'mood' | 'length'; year?: number | null } = $props();

	const CELL = 11;
	const GAP = 3;
	const STEP = CELL + GAP;

	const MOOD_FILLS = ['var(--color-muted)', 'color-mix(in srgb, var(--color-primary) 45%, transparent)', '#ef4444', '#22c55e'];
	const MOOD_LABELS = ['No entry', 'Entry', 'Bad day', 'Good day'];
	const LENGTH_FILLS = [
		'var(--color-muted)',
		'color-mix(in srgb, var(--color-primary) 25%, transparent)',
		'color-mix(in srgb, var(--color-primary) 45%, transparent)',
		'color-mix(in srgb, var(--color-primary) 70%, transparent)',
		'var(--color-primary)'
	];

	const byDate = $derived.by(() => {
		const m = new Map<string, { mood: number; words: number }>();
		const list = Array.isArray(entries) ? entries : [];
		for (const e of list) {
			if (!e || !e.date) continue;
			const cur = m.get(e.date) ?? { mood: 0, words: 0 };
			cur.mood = Math.max(cur.mood, e.isThumbUp ? 3 : e.isThumbDown ? 2 : 1);
			const text = typeof e.bodyText === 'string' ? e.bodyText.trim() : '';
			if (text) cur.words += text.split(/\s+/).length;
			m.set(e.date, cur);
		}
		return m;
	});

	const iso = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

	const range = $derived.by(() => {
		if (year) {
			return { start: new Date(year, 0, 1, 12), end: new Date(year, 11, 31, 12) };
		}
		const end = new Date();
		end.setHours(12, 0, 0, 0);
		const start = new Date(end);
		start.setDate(start.getDate() - 364);
		return { start, end };
	});

	// Quartile thresholds over nonzero word counts within the visible window,
	// so intensity reflects the user's own distribution instead of being
	// flattened by one outlier day
	const quartiles = $derived.by(() => {
		const lo = iso(range.start);
		const hi = iso(range.end);
		const counts = [...byDate.entries()]
			.filter(([key, v]) => key >= lo && key <= hi && v.words > 0)
			.map(([, v]) => v.words)
			.sort((a, b) => a - b);
		if (!counts.length) return null;
		const q = (p: number) => counts[Math.floor(p * (counts.length - 1))];
		return { q1: q(0.25), q2: q(0.5), q3: q(0.75) };
	});

	function lengthLevel(words: number): number {
		if (words <= 0 || !quartiles) return 1;
		const { q1, q2, q3 } = quartiles;
		if (q1 === q3) return 3; // no spread — every writing day is equally typical
		return words > q3 ? 4 : words > q2 ? 3 : words > q1 ? 2 : 1;
	}

	const cells = $derived.by(() => {
		const { start, end } = range;
		const aligned = new Date(start);
		aligned.setDate(aligned.getDate() - aligned.getDay()); // align to that week's Sunday

		const out: { x: number; y: number; fill: string; label: string }[] = [];
		const d = new Date(aligned);
		for (let i = 0; d <= end; i++, d.setDate(d.getDate() + 1)) {
			if (d < start) continue; // alignment padding before Jan 1 — leave blank
			const key = iso(d);
			const day = byDate.get(key);
			let fill: string;
			let label: string;
			if (mode === 'mood') {
				const s = day?.mood ?? 0;
				fill = MOOD_FILLS[s];
				label = MOOD_LABELS[s];
			} else {
				const level = day ? lengthLevel(day.words) : 0;
				fill = LENGTH_FILLS[level];
				label = day ? `${day.words} ${day.words === 1 ? 'word' : 'words'}` : 'No entry';
			}
			out.push({ x: Math.floor(i / 7) * STEP, y: (i % 7) * STEP, fill, label: `${key} — ${label}` });
		}
		return out;
	});

	const width = $derived(cells.length ? cells[cells.length - 1].x + CELL : 0);
	const height = 7 * STEP - GAP;
</script>

<!-- viewBox + w-full scales the grid to the card, so the whole year is always visible -->
<svg data-testid="heatmap" viewBox="0 0 {width} {height}" class="block w-full h-auto">
	{#each cells as cell}
		<rect x={cell.x} y={cell.y} width={CELL} height={CELL} rx="2.5" fill={cell.fill}>
			<title>{cell.label}</title>
		</rect>
	{/each}
</svg>
<div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
	{#if mode === 'mood'}
		{#each MOOD_LABELS as label, i}
			<span class="inline-flex items-center gap-1.5">
				<svg width="11" height="11"><rect width="11" height="11" rx="2.5" fill={MOOD_FILLS[i]} /></svg>
				{label}
			</span>
		{/each}
	{:else}
		<span>Fewer</span>
		{#each LENGTH_FILLS as fill}
			<svg width="11" height="11" class="-mx-1"><rect width="11" height="11" rx="2.5" {fill} /></svg>
		{/each}
		<span>More words</span>
	{/if}
</div>
