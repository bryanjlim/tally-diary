<script lang="ts">
	// GitHub-style year grid: one cell per day for the past 365 days.
	// 0 = no entry, 1 = entry, 2 = bad day, 3 = good day (rated beats plain).
	import type { DiaryEntry } from './types';

	let { entries }: { entries: DiaryEntry[] } = $props();

	const CELL = 11;
	const GAP = 3;
	const STEP = CELL + GAP;

	const FILLS = ['var(--color-muted)', 'color-mix(in srgb, var(--color-primary) 45%, transparent)', '#ef4444', '#22c55e'];
	const LABELS = ['No entry', 'Entry', 'Bad day', 'Good day'];

	const cells = $derived.by(() => {
		const status = new Map<string, number>();
		for (const e of entries) {
			const s = e.isThumbUp ? 3 : e.isThumbDown ? 2 : 1;
			status.set(e.date, Math.max(status.get(e.date) ?? 0, s));
		}
		const end = new Date();
		end.setHours(12, 0, 0, 0);
		const start = new Date(end);
		start.setDate(start.getDate() - 364);
		start.setDate(start.getDate() - start.getDay()); // align to that week's Sunday

		const out: { x: number; y: number; key: string; s: number }[] = [];
		const d = new Date(start);
		for (let i = 0; d <= end; i++, d.setDate(d.getDate() + 1)) {
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			out.push({ x: Math.floor(i / 7) * STEP, y: (i % 7) * STEP, key, s: status.get(key) ?? 0 });
		}
		return out;
	});

	const width = $derived(cells.length ? cells[cells.length - 1].x + CELL : 0);
</script>

<div class="overflow-x-auto pb-1">
	<svg data-testid="heatmap" width={width} height={7 * STEP - GAP} class="block">
		{#each cells as cell}
			<rect
				x={cell.x}
				y={cell.y}
				width={CELL}
				height={CELL}
				rx="2.5"
				fill={FILLS[cell.s]}
			>
				<title>{cell.key} — {LABELS[cell.s]}</title>
			</rect>
		{/each}
	</svg>
</div>
<div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
	{#each LABELS as label, i}
		<span class="inline-flex items-center gap-1.5">
			<svg width="11" height="11"><rect width="11" height="11" rx="2.5" fill={FILLS[i]} /></svg>
			{label}
		</span>
	{/each}
</div>
