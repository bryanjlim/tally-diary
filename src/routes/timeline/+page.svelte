<script lang="ts">
	import { store } from '$lib/stores.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { daysAlive, getCategoryColor } from '$lib/types';
	import { LayoutList, LayoutGrid, Filter, Trash2, ThumbsUp, ThumbsDown, Search } from 'lucide-svelte';

	// Deep link from Insights: /timeline?tally=Chipotle pre-applies the tally filter
	const tallyParam = page.url.searchParams.get('tally') || '';

	let cardView = $state(true);
	let showFilters = $state(!!tallyParam);
	let filterStartDate = $state('');
	let filterEndDate = $state('');
	let filterText = $state('');
	let filterTally = $state(tallyParam);
	let filterGoodDays = $state(false);
	let filterBadDays = $state(false);
	let deleteIndex = $state(-1);

	function formatDate(dateStr: string): string {
		const d = new Date((dateStr || '') + "T12:00:00");
		if (isNaN(d.getTime())) return dateStr || '';
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
	}

	function truncate(text: string, len: number): string {
		if (!text) return '';
		return text.length > len ? text.slice(0, len) + '...' : text;
	}

	function filteredEntries() {
		const entries = Array.isArray(store.entries) ? store.entries : [];
		return entries.filter((entry, _i) => {
			if (!entry) return false;
			if (filterStartDate && new Date(entry.date) < new Date(filterStartDate)) return false;
			if (filterEndDate && new Date(entry.date) > new Date(filterEndDate)) return false;
			if (filterText && entry.bodyText && !entry.bodyText.toLowerCase().includes(filterText.toLowerCase())) return false;
			const tallies = Array.isArray(entry.tallies) ? entry.tallies : [];
			if (filterTally && !tallies.some(t => t && t.text && t.text.toLowerCase().includes(filterTally.toLowerCase()))) return false;
			if (filterGoodDays && !entry.isThumbUp) return false;
			if (filterBadDays && !entry.isThumbDown) return false;
			return true;
		});
	}

	function clearFilters() {
		filterStartDate = '';
		filterEndDate = '';
		filterText = '';
		filterTally = '';
		filterGoodDays = false;
		filterBadDays = false;
	}

	function confirmDelete(index: number) {
		deleteIndex = index;
	}

	function doDelete() {
		if (deleteIndex >= 0) {
			store.deleteEntry(deleteIndex);
			deleteIndex = -1;
		}
	}
</script>

<div class="animate-fade-in space-y-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h2 class="text-2xl sm:text-3xl font-bold text-foreground">My Entries</h2>
			<p class="text-muted-foreground mt-1">{filteredEntries().length} entries</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={() => showFilters = !showFilters}
				class="p-2 rounded-lg transition-colors cursor-pointer {showFilters ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				aria-label="Toggle filters"
			>
				<Filter class="w-5 h-5" />
			</button>
			<button
				onclick={() => cardView = true}
				class="p-2 rounded-lg transition-colors cursor-pointer {cardView ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				aria-label="Card view"
			>
				<LayoutGrid class="w-5 h-5" />
			</button>
			<button
				onclick={() => cardView = false}
				class="p-2 rounded-lg transition-colors cursor-pointer {!cardView ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				aria-label="List view"
			>
				<LayoutList class="w-5 h-5" />
			</button>
		</div>
	</div>

	<!-- Filters -->
	{#if showFilters}
		<div class="rounded-xl border border-border bg-card p-4 space-y-3 animate-scale-in">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-semibold text-foreground">Filters</h3>
				<button onclick={clearFilters} class="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Clear all</button>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div>
					<label class="block text-xs text-muted-foreground mb-1">Start Date</label>
					<input type="date" bind:value={filterStartDate} class="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
				</div>
				<div>
					<label class="block text-xs text-muted-foreground mb-1">End Date</label>
					<input type="date" bind:value={filterEndDate} class="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
				</div>
				<div class="relative">
					<label class="block text-xs text-muted-foreground mb-1">Body Text</label>
					<div class="relative">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
						<input type="text" bind:value={filterText} placeholder="Search text..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
					</div>
				</div>
				<div>
					<label class="block text-xs text-muted-foreground mb-1">Tally Filter</label>
					<input type="text" bind:value={filterTally} placeholder="e.g., Chipotle" class="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
				</div>
			</div>
			<div class="flex gap-4">
				<label class="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
					<input type="checkbox" bind:checked={filterGoodDays} class="rounded" /> Good days only
				</label>
				<label class="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
					<input type="checkbox" bind:checked={filterBadDays} class="rounded" /> Bad days only
				</label>
			</div>
		</div>
	{/if}

	<!-- Entries -->
	{#if filteredEntries().length === 0}
		<div class="text-center py-16">
			<p class="text-muted-foreground">No entries yet. Start writing!</p>
		</div>
	{:else if cardView}
		<div class="space-y-4">
			{#each filteredEntries() as entry, i}
				{@const realIndex = store.entries.indexOf(entry)}
				<div class="relative rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200 hover:shadow-md group">
					<button
						class="w-full text-left p-5 cursor-pointer"
						onclick={() => goto(`/timeline/${realIndex}`)}
					>
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0 flex-1 pr-8">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-xs font-semibold text-primary">Day {daysAlive(entry.date, store.preferences.dateOfBirth)}</span>
									<span class="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
									{#if entry.isThumbUp}
										<ThumbsUp class="w-3.5 h-3.5 text-green-500" fill="currentColor" />
									{/if}
									{#if entry.isThumbDown}
										<ThumbsDown class="w-3.5 h-3.5 text-red-500" fill="currentColor" />
									{/if}
								</div>
								{#if entry.title}
									<h3 class="text-base font-semibold text-foreground truncate">
										{entry.title}
									</h3>
								{/if}
								{#if entry.bodyText}
									<p class="text-sm text-muted-foreground mt-1 line-clamp-2">{truncate(entry.bodyText, 150)}</p>
								{/if}
								{#if Array.isArray(entry.tallies) && entry.tallies.length > 0}
									<div class="flex flex-wrap gap-1.5 mt-2">
										{#each entry.tallies.slice(0, 5) as tally}
											<span class="text-[10px] font-medium px-2 py-0.5 rounded-full {getCategoryColor(tally.type)}">
												{tally.text}
											</span>
										{/each}
										{#if entry.tallies.length > 5}
											<span class="text-[10px] text-muted-foreground">+{entry.tallies.length - 5}</span>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</button>
					<button
						onclick={() => confirmDelete(realIndex)}
						class="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
						aria-label="Delete entry"
					>
						<Trash2 class="w-4 h-4" />
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Headline/compact view -->
		<div class="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
			{#each filteredEntries() as entry, i}
				{@const realIndex = store.entries.indexOf(entry)}
				<div class="flex items-center group hover:bg-muted/50 transition-colors">
					<button
						class="flex-1 flex items-center gap-3 px-4 py-3 text-left cursor-pointer min-w-0"
						onclick={() => goto(`/timeline/${realIndex}`)}
					>
						<span class="text-xs font-semibold text-primary whitespace-nowrap">Day {daysAlive(entry.date, store.preferences.dateOfBirth)}</span>
						<span class="text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.date)}</span>
						{#if entry.title}
							<span class="text-sm font-medium text-foreground truncate">{entry.title}</span>
						{/if}
						<div class="flex items-center gap-1 ml-auto shrink-0">
							{#if entry.isThumbUp}
								<ThumbsUp class="w-3 h-3 text-green-500" fill="currentColor" />
							{/if}
							{#if entry.isThumbDown}
								<ThumbsDown class="w-3 h-3 text-red-500" fill="currentColor" />
							{/if}
						</div>
					</button>
					<button
						onclick={() => confirmDelete(realIndex)}
						class="p-2 mr-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
						aria-label="Delete entry"
					>
						<Trash2 class="w-3.5 h-3.5" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation -->
{#if deleteIndex >= 0}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => deleteIndex = -1} aria-label="Cancel"></button>
		<div class="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm animate-scale-in p-6 space-y-4">
			<h3 class="text-lg font-semibold text-foreground">Delete Entry?</h3>
			<p class="text-sm text-muted-foreground">This action cannot be undone. This entry will be permanently deleted.</p>
			<div class="flex gap-3 justify-end">
				<button onclick={() => deleteIndex = -1} class="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Cancel</button>
				<button onclick={doDelete} class="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer">Delete</button>
			</div>
		</div>
	</div>
{/if}
