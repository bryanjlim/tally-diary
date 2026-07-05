<script lang="ts">
	import { store } from '$lib/stores.svelte';
	import { goto } from '$app/navigation';
	import { TALLY_CATEGORIES, categoryIcons, type TallyCategory } from '$lib/types';
	import TallyMarks from '$lib/TallyMarks.svelte';
	import Heatmap from '$lib/Heatmap.svelte';
	import {
		streaks,
		goodDayStats,
		goodDayCorrelations,
		tallyTrends,
		onThisDay,
		milestones,
		writingStats
	} from '$lib/insights';
	import {
		BookOpen,
		Hash,
		Flame,
		PenLine,
		Smile,
		Trophy,
		History,
		CalendarDays,
		TrendingUp,
		TrendingDown,
		ChevronDown,
		ChevronUp
	} from 'lucide-svelte';

	interface TallyAgg { text: string; count: number; }

	const categoryColors: Record<TallyCategory, string> = {
		Food: 'text-amber-700 dark:text-amber-400',
		Activity: 'text-green-700 dark:text-green-400',
		Location: 'text-blue-600 dark:text-blue-400',
		Person: 'text-purple-600 dark:text-purple-400',
		Other: 'text-gray-600 dark:text-gray-400',
	};

	function getAggregateTallies(): Record<TallyCategory, TallyAgg[]> {
		const result: Record<string, TallyAgg[]> = {
			Food: [], Activity: [], Location: [], Person: [], Other: [],
		};
		for (const entry of store.entries) {
			for (const tally of entry.tallies) {
				const arr = result[tally.type];
				const existing = arr.find(t => t.text === tally.text);
				if (existing) existing.count++;
				else arr.push({ text: tally.text, count: 1 });
			}
		}
		for (const key of Object.keys(result)) {
			result[key].sort((a, b) => b.count - a.count);
		}
		return result as Record<TallyCategory, TallyAgg[]>;
	}

	let expandedCategories = $state<Record<string, boolean>>({});

	function toggleCategory(cat: string) {
		expandedCategories = { ...expandedCategories, [cat]: !expandedCategories[cat] };
	}

	const tallyAggs = $derived(getAggregateTallies());
	const totalTallies = $derived(Object.values(tallyAggs).reduce((sum, arr) => sum + arr.length, 0));

	const streak = $derived(streaks(store.entries));
	const words = $derived(writingStats(store.entries));
	const goodDays = $derived(goodDayStats(store.entries));
	const correlations = $derived(goodDayCorrelations(store.entries));
	const trends = $derived(tallyTrends(store.entries));
	const anniversaries = $derived(onThisDay(store.entries));
	const milestoneLines = $derived(milestones(store.entries, store.preferences.dateOfBirth));
</script>

{#snippet sectionHeader(Icon: typeof BookOpen, iconClass: string, title: string, subtitle?: string)}
	<div class="flex items-center gap-3">
		<div class="p-2 rounded-lg {iconClass}">
			<Icon class="w-5 h-5" />
		</div>
		<div>
			<h3 class="text-base font-semibold text-foreground">{title}</h3>
			{#if subtitle}
				<p class="text-xs text-muted-foreground">{subtitle}</p>
			{/if}
		</div>
	</div>
{/snippet}

<div class="animate-fade-in space-y-6">
	<div>
		<h2 class="text-2xl sm:text-3xl font-bold text-foreground">Insights</h2>
		<p class="text-muted-foreground mt-1">Your diary at a glance</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class="rounded-xl border border-border bg-card p-5 glass">
			<div class="flex items-center gap-3 mb-3">
				<div class="p-2 rounded-lg bg-primary/10">
					<BookOpen class="w-5 h-5 text-primary" />
				</div>
				<h3 class="text-sm font-medium text-muted-foreground">Entries Written</h3>
			</div>
			<p class="text-4xl font-bold text-foreground">{store.entries.length}</p>
			<p class="text-xs text-muted-foreground mt-1">{words.total.toLocaleString()} words · ≈{words.avg} per entry</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-5 glass">
			<div class="flex items-center gap-3 mb-3">
				<div class="p-2 rounded-lg bg-orange-500/10">
					<Flame class="w-5 h-5 text-orange-500" />
				</div>
				<h3 class="text-sm font-medium text-muted-foreground">Current Streak</h3>
			</div>
			<p class="text-4xl font-bold text-foreground">{streak.current}<span class="text-lg font-medium text-muted-foreground ml-1.5">{streak.current === 1 ? 'day' : 'days'}</span></p>
			<p class="text-xs text-muted-foreground mt-1">Longest: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-5 glass">
			<div class="flex items-center gap-3 mb-3">
				<div class="p-2 rounded-lg bg-accent/10">
					<Hash class="w-5 h-5 text-accent" />
				</div>
				<h3 class="text-sm font-medium text-muted-foreground">Unique Tallies</h3>
			</div>
			<p class="text-4xl font-bold text-foreground">{totalTallies}</p>
		</div>

		{#if goodDays}
			<div class="rounded-xl border border-border bg-card p-5 glass">
				<div class="flex items-center gap-3 mb-3">
					<div class="p-2 rounded-lg bg-green-500/10">
						<Smile class="w-5 h-5 text-green-500" />
					</div>
					<h3 class="text-sm font-medium text-muted-foreground">Good Days</h3>
				</div>
				<p class="text-4xl font-bold text-foreground">{goodDays.pctGood}%</p>
				<p class="text-xs text-muted-foreground mt-1">
					of {goodDays.rated} rated {goodDays.rated === 1 ? 'entry' : 'entries'}{goodDays.bestMonth ? ` · best: ${goodDays.bestMonth.label} (${goodDays.bestMonth.pct}%)` : ''}
				</p>
			</div>
		{/if}
	</div>

	<!-- On This Day -->
	{#if anniversaries.length > 0}
		<div class="rounded-xl border border-primary/30 bg-primary/5 p-5">
			{@render sectionHeader(History, 'bg-primary/10 text-primary', 'On This Day')}
			<div class="mt-3 space-y-2">
				{#each anniversaries as a}
					<button
						onclick={() => goto(`/timeline/${a.index}`)}
						class="w-full text-left px-2 py-1.5 -mx-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group"
					>
						<span class="text-xs font-semibold text-primary">{a.yearsAgo} {a.yearsAgo === 1 ? 'year' : 'years'} ago</span>
						<span class="ml-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">{a.title}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Past Year Heatmap -->
	{#if store.entries.length > 0}
		<div class="rounded-xl border border-border bg-card p-5">
			{@render sectionHeader(CalendarDays, 'bg-primary/10 text-primary', 'Past Year', 'One square per day')}
			<div class="mt-4">
				<Heatmap entries={store.entries} />
			</div>
		</div>
	{/if}

	<!-- What makes a good day -->
	{#if correlations.length > 0}
		<div class="rounded-xl border border-border bg-card p-5" id="correlations">
			{@render sectionHeader(Smile, 'bg-green-500/10 text-green-500', 'What Makes a Good Day', `Tallies on your thumbs-up days · average day is ${correlations[0].baseline}% good`)}
			<div class="mt-3 space-y-1">
				{#each correlations as c}
					{@const Icon = categoryIcons[c.type]}
					{@const delta = c.pct - c.baseline}
					<div class="flex items-center justify-between gap-3 py-1.5">
						<span class="inline-flex items-center gap-2 {categoryColors[c.type]} min-w-0">
							<Icon class="w-3.5 h-3.5 shrink-0" />
							<span class="text-sm font-medium text-foreground truncate">{c.text}</span>
						</span>
						<span class="text-sm tabular-nums shrink-0 {delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
							{c.pct}% good
							<span class="text-xs text-muted-foreground">({delta >= 0 ? '+' : ''}{delta} · {c.count} days)</span>
						</span>
					</div>
				{/each}
			</div>
			<p class="text-[11px] text-muted-foreground mt-3">Correlation, not causation — but worth noticing.</p>
		</div>
	{/if}

	<!-- Trends -->
	{#if trends.movers.length > 0 || trends.lapsed.length > 0}
		<div class="rounded-xl border border-border bg-card p-5">
			{@render sectionHeader(TrendingUp, 'bg-blue-500/10 text-blue-500', 'Tally Trends', 'Last 30 days vs the 30 before')}
			<div class="mt-3 space-y-1">
				{#each trends.movers as m}
					{@const Icon = categoryIcons[m.type]}
					{@const up = m.cur > m.prev}
					<div class="flex items-center justify-between gap-3 py-1.5">
						<span class="inline-flex items-center gap-2 {categoryColors[m.type]} min-w-0">
							<Icon class="w-3.5 h-3.5 shrink-0" />
							<span class="text-sm font-medium text-foreground truncate">{m.text}</span>
						</span>
						<span class="inline-flex items-center gap-1.5 text-sm tabular-nums shrink-0 {up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
							{#if up}<TrendingUp class="w-3.5 h-3.5" />{:else}<TrendingDown class="w-3.5 h-3.5" />{/if}
							{m.prev} → {m.cur}
						</span>
					</div>
				{/each}
				{#each trends.lapsed as l}
					{@const Icon = categoryIcons[l.type]}
					<div class="flex items-center justify-between gap-3 py-1.5">
						<span class="inline-flex items-center gap-2 {categoryColors[l.type]} min-w-0">
							<Icon class="w-3.5 h-3.5 shrink-0" />
							<span class="text-sm font-medium text-foreground truncate">{l.text}</span>
						</span>
						<span class="text-xs text-muted-foreground shrink-0">not logged in {l.daysAgo} days</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Milestones -->
	{#if milestoneLines.length > 0}
		<div class="rounded-xl border border-border bg-card p-5">
			{@render sectionHeader(Trophy, 'bg-amber-500/10 text-amber-600 dark:text-amber-400', 'Milestones')}
			<ul class="mt-3 space-y-1.5">
				{#each milestoneLines as line}
					<li class="text-sm text-foreground flex items-baseline gap-2">
						<span class="text-amber-600 dark:text-amber-400">•</span>
						{line}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- All Tallies -->
	<div class="rounded-xl border border-border bg-card overflow-hidden">
		<div class="p-5 border-b border-border">
			{@render sectionHeader(Hash, 'bg-green-500/10 text-green-500', 'All Tallies')}
		</div>

		{#each TALLY_CATEGORIES as category}
			{@const items = tallyAggs[category]}
			{@const Icon = categoryIcons[category]}
			<div class="border-b border-border last:border-b-0">
				<button
					onclick={() => toggleCategory(category)}
					class="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
				>
					<div class="flex items-center gap-2 {categoryColors[category]}">
						<Icon class="w-4 h-4" />
						<span class="font-medium text-sm">{category}</span>
						<span class="text-xs text-muted-foreground">({items.length})</span>
					</div>
					{#if expandedCategories[category]}
						<ChevronUp class="w-4 h-4 text-muted-foreground" />
					{:else}
						<ChevronDown class="w-4 h-4 text-muted-foreground" />
					{/if}
				</button>
				{#if expandedCategories[category]}
					<div class="px-5 pb-3 space-y-1 animate-fade-in">
						{#if items.length === 0}
							<p class="text-xs text-muted-foreground py-1">No tallies yet</p>
						{:else}
							{#each items as item}
								<button
									onclick={() => goto(`/timeline?tally=${encodeURIComponent(item.text)}`)}
									class="w-full flex items-center justify-between gap-3 py-1 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
									title="Show entries with this tally"
								>
									<span class="text-sm text-foreground truncate group-hover:text-primary transition-colors">{item.text}</span>
									<span class="flex items-center gap-2 shrink-0">
										<span class={categoryColors[category]}>
											<TallyMarks count={item.count} />
										</span>
										<span class="text-sm font-semibold text-muted-foreground tabular-nums w-8 text-right">{item.count}</span>
									</span>
								</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
