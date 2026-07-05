<script lang="ts">
	// GitHub-style year grid: one cell per day for the past 365 days.
	// mode 'mood':   0 no entry, 1 entry, 2 bad day, 3 good day
	// mode 'length': 0 no entry, 1-4 words-per-day bucket relative to the busiest day
	import type { DiaryEntry } from './types';

	let { entries, mode = 'mood' }: { entries: DiaryEntry[]; mode?: 'mood' | 'length' } = $props();

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
		for (const e of entries) {
			const cur = m.get(e.date) ?? { mood: 0, words: 0 };
			cur.mood = Math.max(cur.mood, e.isThumbUp ? 3 : e.isThumbDown ? 2 : 1);
			if (e.bodyText?.trim()) cur.words += e.bodyText.trim().split(/\s+/).length;
			m.set(e.date, cur);
		}
		return m;
	});

	const maxWords = $derived(Math.max(1, ...[...byDate.values()].map((v) => v.words)));

	function lengthLevel(words: number): number {
		const r = words / maxWords;
		return r > 0.66 ? 4 : r > 0.33 ? 3 : words > 0 ? 2 : 1;
	}

	const cells = $derived.by(() => {
		const end = new Date();
		end.setHours(12, 0, 0, 0);
		const start = new Date(end);
		start.setDate(start.getDate() - 364);
		start.setDate(start.getDate() - start.getDay()); // align to that week's Sunday

		const out: { x: number; y: number; fill: string; label: string }[] = [];
		const d = new Date(start);
		for (let i = 0; d <= end; i++, d.setDate(d.getDate() + 1)) {
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
