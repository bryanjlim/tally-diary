<script lang="ts">
	import { store } from '$lib/stores.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { type TallyMark, daysAlive, categoryColors, categoryIcons } from '$lib/types';
	import TallyDialog from '$lib/TallyDialog.svelte';
	import Toast from '$lib/Toast.svelte';
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
	let showSuccess = $state(false);
	let initializedIndex = $state(-1);

	$effect(() => {
		if (entry && initializedIndex !== index) {
			title = entry.title || '';
			date = entry.date || '';
			bodyText = entry.bodyText || '';
			tallies = [...(entry.tallies || [])];
			isThumbUp = entry.isThumbUp || false;
			isThumbDown = entry.isThumbDown || false;
			initializedIndex = index;
		}
	});

	function toggleThumbUp() {
		isThumbUp = !isThumbUp;
		if (isThumbUp) isThumbDown = false;
	}

	function toggleThumbDown() {
		isThumbDown = !isThumbDown;
		if (isThumbDown) isThumbUp = false;
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
		goto(`/timeline/${newIndex}`);
	}
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
						<span class="text-lg font-semibold text-primary whitespace-nowrap">Day {daysAlive(date, store.preferences.dateOfBirth)}</span>
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
					<button onclick={() => showTallyDialog = true} class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background font-medium text-sm text-foreground hover:bg-muted transition-colors cursor-pointer">
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
								{@const Icon = categoryIcons[tally.type]}
								<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border {categoryColors[tally.type]}">
									<Icon class="w-3 h-3" />
									{tally.text}
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

	<TallyDialog bind:open={showTallyDialog} bind:tallies />

	{#if showSuccess}
		<Toast message="Entry updated!" />
	{/if}
{/if}
