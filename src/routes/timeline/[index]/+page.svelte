<script lang="ts">
	import { store } from '$lib/stores.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { TALLY_CATEGORIES, type TallyMark, type TallyCategory } from '$lib/types';
	import { ThumbsUp, ThumbsDown, Save, ArrowLeft, ArrowRight, ChevronLeft, Tag, X } from 'lucide-svelte';

	const index = $derived(parseInt(page.params.index || '0'));
	const entry = $derived(store.entries[index]);

	let title = $state('');
	let date = $state('');
	let bodyText = $state('');
	let tallies = $state<TallyMark[]>([]);
	let isThumbUp = $state(false);
	let isThumbDown = $state(false);
	let showTallyDialog = $state(false);
	let tallyCategory = $state<TallyCategory>('Food');
	let tallyText = $state('');
	let tallyError = $state('');
	let showSuccess = $state(false);
	let initialized = $state(false);

	$effect(() => {
		if (entry && !initialized) {
			title = entry.title || '';
			date = entry.date || '';
			bodyText = entry.bodyText || '';
			tallies = [...(entry.tallies || [])];
			isThumbUp = entry.isThumbUp || false;
			isThumbDown = entry.isThumbDown || false;
			initialized = true;
		}
	});

	function getDaysAlive(): number {
		const dob = store.preferences.dateOfBirth;
		if (!dob || !date) return 0;
		return Math.round((new Date(date).getTime() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24)) + 1;
	}

	function toggleThumbUp() {
		isThumbUp = !isThumbUp;
		if (isThumbUp) isThumbDown = false;
	}

	function toggleThumbDown() {
		isThumbDown = !isThumbDown;
		if (isThumbDown) isThumbUp = false;
	}

	function addTally() {
		if (!tallyText.trim()) { tallyError = 'Please enter a label'; return; }
		tallies = [...tallies, { type: tallyCategory, text: tallyText.trim() }];
		tallyText = '';
		tallyError = '';
	}

	function removeTally(i: number) {
		tallies = tallies.filter((_, idx) => idx !== i);
	}

	function updateEntry() {
		store.updateEntry(index, {
			id: entry.id,
			batchId: entry.batchId,
			title, date, bodyText,
			tallies: [...tallies],
			isThumbUp, isThumbDown,
			entryNumber: entry?.entryNumber || index + 1,
		});
		showSuccess = true;
		setTimeout(() => showSuccess = false, 3000);
	}

	function navigateTo(newIndex: number) {
		initialized = false;
		goto(`/timeline/${newIndex}`);
	}

	const categoryColors: Record<TallyCategory, string> = {
		Food: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
		Activity: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
		Location: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
		Person: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
		Other: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
	};
</script>

{#if !entry}
	<div class="text-center py-16">
		<p class="text-muted-foreground">Entry not found.</p>
		<button onclick={() => goto('/timeline')} class="mt-4 text-primary hover:underline cursor-pointer">Back to timeline</button>
	</div>
{:else}
	<div class="animate-fade-in space-y-6">
		<!-- Back + Nav -->
		<div class="flex items-center justify-between">
			<button onclick={() => goto('/timeline')} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
				<ChevronLeft class="w-4 h-4" /> Back
			</button>
			<div class="flex items-center gap-1">
				<button
					disabled={index <= 0}
					onclick={() => navigateTo(index - 1)}
					class="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
					aria-label="Previous entry"
				>
					<ArrowLeft class="w-4 h-4" />
				</button>
				<span class="text-xs text-muted-foreground">{index + 1} / {store.entries.length}</span>
				<button
					disabled={index >= store.entries.length - 1}
					onclick={() => navigateTo(index + 1)}
					class="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
					aria-label="Next entry"
				>
					<ArrowRight class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Entry Card -->
		<div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
			<div class="p-5 sm:p-6 space-y-5">
				<div class="space-y-3">
					<div class="flex items-baseline gap-3">
						<span class="text-lg font-semibold text-primary whitespace-nowrap">Day {getDaysAlive()}</span>
						<div class="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
					</div>
					<input type="text" bind:value={title} placeholder="Title..." class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 text-lg" />
				</div>

				<div>
					<label for="edit-date" class="block text-sm font-medium text-muted-foreground mb-1.5">Date</label>
					<input id="edit-date" type="date" bind:value={date} class="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
				</div>

				<div>
					<label for="edit-body" class="block text-sm font-medium text-muted-foreground mb-1.5">Your Thoughts</label>
					<textarea id="edit-body" bind:value={bodyText} rows={8} placeholder="Your thoughts..." class="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-y min-h-[120px]"></textarea>
				</div>

				<div class="flex items-center gap-3 flex-wrap">
					<button onclick={() => showTallyDialog = true} class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all shadow-sm cursor-pointer">
						<Tag class="w-4 h-4" /> Add Tally
					</button>
					<div class="flex items-center gap-1 ml-auto">
						<button onclick={toggleThumbUp} class="p-2 rounded-lg transition-all cursor-pointer {isThumbUp ? 'bg-green-500/15 text-green-500 ring-1 ring-green-500/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
							<ThumbsUp class="w-5 h-5" fill={isThumbUp ? 'currentColor' : 'none'} />
						</button>
						<button onclick={toggleThumbDown} class="p-2 rounded-lg transition-all cursor-pointer {isThumbDown ? 'bg-red-500/15 text-red-500 ring-1 ring-red-500/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
							<ThumbsDown class="w-5 h-5" fill={isThumbDown ? 'currentColor' : 'none'} />
						</button>
					</div>
				</div>

				{#if tallies.length > 0}
					<div class="pt-1">
						<h4 class="text-sm font-medium text-muted-foreground mb-2">Tally Marks</h4>
						<div class="flex flex-wrap gap-2">
							{#each tallies as tally, i}
								<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border {categoryColors[tally.type]}">
									{tally.type} &middot; {tally.text}
									<button onclick={() => removeTally(i)} class="hover:brightness-125 cursor-pointer"><X class="w-3.5 h-3.5" /></button>
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="px-5 sm:px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
				<button onclick={() => goto('/timeline')} class="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Back</button>
				<button onclick={updateEntry} class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all shadow-md cursor-pointer">
					<Save class="w-4 h-4" /> Update
				</button>
			</div>
		</div>
	</div>

	<!-- Tally Dialog -->
	{#if showTallyDialog}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showTallyDialog = false} aria-label="Close"></button>
			<div class="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-scale-in p-6 space-y-4">
				<h3 class="text-lg font-semibold text-foreground">Add Tally Mark</h3>
				<div>
					<label for="edit-tally-cat" class="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
					<select id="edit-tally-cat" bind:value={tallyCategory} class="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40">
						{#each TALLY_CATEGORIES as cat}<option value={cat}>{cat}</option>{/each}
					</select>
				</div>
				<div>
					<label for="edit-tally-label" class="block text-sm font-medium text-muted-foreground mb-1.5">Label</label>
					<input id="edit-tally-label" type="text" bind:value={tallyText} placeholder="e.g., Chipotle" class="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" onkeydown={(e) => { if (e.key === 'Enter') addTally(); }} />
					{#if tallyError}<p class="text-xs text-destructive mt-1">{tallyError}</p>{/if}
				</div>
				<div class="flex gap-3 justify-end pt-2">
					<button onclick={() => { showTallyDialog = false; tallyError = ''; }} class="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Done</button>
					<button onclick={addTally} class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer">Add</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Success Toast -->
	{#if showSuccess}
		<div class="fixed bottom-6 right-6 z-50 animate-fade-in">
			<div class="glass border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
				<div class="w-2 h-2 rounded-full bg-green-500"></div>
				<span class="text-sm font-medium text-foreground">Entry updated!</span>
			</div>
		</div>
	{/if}
{/if}
