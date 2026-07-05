<script lang="ts">
	import { store } from '$lib/stores.svelte';
	import { goto } from '$app/navigation';
	import { TALLY_CATEGORIES, categoryIcons, type TallyCategory } from '$lib/types';
	import TallyMarks from '$lib/TallyMarks.svelte';
	import { BookOpen, Hash, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-svelte';

	interface TallyAgg { text: string; count: number; }

	const categoryColors: Record<TallyCategory, string> = {
		Food: 'text-amber-700 dark:text-amber-400',
		Activity: 'text-green-700 dark:text-green-400',
		Location: 'text-blue-600 dark:text-blue-400',
		Person: 'text-purple-600 dark:text-purple-400',
		Other: 'text-gray-600 dark:text-gray-400',
	};

	function getEntriesCount(): number {
		return store.entries.length;
	}

	function getYearOldEntry(): { index: number; title: string } | null {
		const now = new Date();
		for (let i = 0; i < store.entries.length; i++) {
			const entryDate = new Date(store.entries[i].date);
			const diffDays = Math.round((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
			if (diffDays >= 364 && diffDays <= 366) {
				return { index: i, title: store.entries[i].title };
			}
		}
		return null;
	}

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

	const yearOldEntry = $derived(getYearOldEntry());
	const tallyAggs = $derived(getAggregateTallies());
	const totalTallies = $derived(Object.values(tallyAggs).reduce((sum, arr) => sum + arr.length, 0));
</script>

<div class="animate-fade-in space-y-6">
	<div>
		<h2 class="text-2xl sm:text-3xl font-bold text-foreground">Insights</h2>
		<p class="text-muted-foreground mt-1">Your diary at a glance</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<!-- Entries Written -->
		<div class="rounded-xl border border-border bg-card p-5 glass">
			<div class="flex items-center gap-3 mb-3">
				<div class="p-2 rounded-lg bg-primary/10">
					<BookOpen class="w-5 h-5 text-primary" />
				</div>
				<h3 class="text-sm font-medium text-muted-foreground">Entries Written</h3>
			</div>
			<p class="text-4xl font-bold text-foreground">{getEntriesCount()}</p>
		</div>

		<!-- Unique Tallies -->
		<div class="rounded-xl border border-border bg-card p-5 glass">
			<div class="flex items-center gap-3 mb-3">
				<div class="p-2 rounded-lg bg-accent/10">
					<Hash class="w-5 h-5 text-accent" />
				</div>
				<h3 class="text-sm font-medium text-muted-foreground">Unique Tallies</h3>
			</div>
			<p class="text-4xl font-bold text-foreground">{totalTallies}</p>
		</div>
	</div>

	<!-- Year Old Diary -->
	{#if yearOldEntry}
		<div class="rounded-xl border border-primary/30 bg-primary/5 p-5">
			<div class="flex items-center gap-3 mb-2">
				<div class="p-2 rounded-lg bg-primary/10">
					<Calendar class="w-5 h-5 text-primary" />
				</div>
				<h3 class="text-sm font-semibold text-primary">One Year Ago Today</h3>
			</div>
			<p class="text-foreground font-medium">{yearOldEntry.title}</p>
			<button
				onclick={() => goto(`/timeline/${yearOldEntry.index}`)}
				class="mt-2 text-sm text-primary hover:underline cursor-pointer"
			>
				Read this entry →
			</button>
		</div>
	{/if}

	<!-- All Tallies -->
	<div class="rounded-xl border border-border bg-card overflow-hidden">
		<div class="p-5 border-b border-border">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-green-500/10">
					<TrendingUp class="w-5 h-5 text-green-500" />
				</div>
				<h3 class="text-base font-semibold text-foreground">All Tallies</h3>
			</div>
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
