<script lang="ts">
	// Renders a count as classic tally marks: groups of four strokes with a diagonal fifth.
	// ponytail: caps at 25 strokes — the numeric count is always shown next to it.
	let { count }: { count: number } = $props();

	const shown = $derived(Math.min(Math.max(count, 0), 25));
	const groups = $derived(Math.floor(shown / 5));
	const rest = $derived(shown % 5);
</script>

{#if shown > 0}
<span class="inline-flex items-center gap-1.5" aria-hidden="true">
	{#each Array(groups) as _}
		<svg width="17" height="14" viewBox="0 0 17 14" class="shrink-0">
			{#each [2, 6, 10, 14] as x}
				<line x1={x} y1="1" x2={x} y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			{/each}
			<line x1="0" y1="11" x2="16" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	{/each}
	{#if rest > 0}
		<svg width={(rest - 1) * 4 + 4} height="14" viewBox="0 0 {(rest - 1) * 4 + 4} 14" class="shrink-0">
			{#each Array(rest) as _, i}
				<line x1={i * 4 + 2} y1="1" x2={i * 4 + 2} y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			{/each}
		</svg>
	{/if}
</span>
{/if}
