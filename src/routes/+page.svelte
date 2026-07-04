<script lang="ts">
	import { store } from "$lib/stores.svelte";
	import { type TallyMark, generateId, daysAlive, categoryColors } from "$lib/types";
	import TallyDialog from "$lib/TallyDialog.svelte";
	import Toast from "$lib/Toast.svelte";
	import { ThumbsUp, ThumbsDown, Save, X, Tag } from "lucide-svelte";

	let title = $state("");
	let date = $state(formatDateForInput(new Date()));
	let bodyText = $state("");
	let tallies = $state<TallyMark[]>([]);
	let isThumbUp = $state(false);
	let isThumbDown = $state(false);
	let showTallyDialog = $state(false);
	let showSuccess = $state(false);
	let successTimeout: ReturnType<typeof setTimeout>;

	function formatDateForInput(d: Date): string {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	}

	function toggleThumbUp() {
		isThumbUp = !isThumbUp;
		if (isThumbUp) isThumbDown = false;
	}

	function toggleThumbDown() {
		isThumbDown = !isThumbDown;
		if (isThumbDown) isThumbUp = false;
	}

	function removeTally(index: number) {
		tallies = tallies.filter((_, i) => i !== index);
	}

	function submitEntry() {
		if (!date) return;
		store.addEntry({
			id: generateId(),
			title,
			date,
			bodyText,
			tallies: [...tallies],
			isThumbUp,
			isThumbDown,
			entryNumber: store.entries.length + 1,
		});

		// Reset form
		title = "";
		date = formatDateForInput(new Date());
		bodyText = "";
		tallies = [];
		isThumbUp = false;
		isThumbDown = false;

		// Show success
		showSuccess = true;
		clearTimeout(successTimeout);
		successTimeout = setTimeout(() => (showSuccess = false), 3000);
	}
</script>

<div class="animate-fade-in space-y-6">
	<!-- Header -->
	<div>
		<h2 class="text-2xl sm:text-3xl font-bold text-foreground">
			New Entry
		</h2>
		<p class="text-muted-foreground mt-1">
			Record your day, track what matters
		</p>
	</div>

	<!-- Entry Card -->
	<div
		class="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
	>
		<div class="p-5 sm:p-6 space-y-5">
			<!-- Day & Title -->
			<div class="space-y-3">
				<div class="flex items-baseline gap-3">
					<span
						class="text-lg font-semibold text-primary whitespace-nowrap"
					>
						Day {daysAlive(date, store.preferences.dateOfBirth)}
					</span>
					<div
						class="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"
					></div>
				</div>
				<input
					type="text"
					bind:value={title}
					placeholder="Give this day a title..."
					class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow text-lg"
				/>
			</div>

			<!-- Date -->
			<div>
				<label
					for="entry-date"
					class="block text-sm font-medium text-muted-foreground mb-1.5"
					>Date</label
				>
				<input
					id="entry-date"
					type="date"
					bind:value={date}
					class="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
				/>
			</div>

			<!-- Body Text -->
			<div>
				<label
					for="entry-body"
					class="block text-sm font-medium text-muted-foreground mb-1.5"
					>Your Thoughts</label
				>
				<textarea
					id="entry-body"
					bind:value={bodyText}
					rows={8}
					placeholder="How was your day?"
					class="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow resize-y min-h-[120px]"
				></textarea>
			</div>

			<!-- Tallies & Mood Row -->
			<div class="flex items-center gap-3 flex-wrap">
				<button
					onclick={() => (showTallyDialog = true)}
					class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all shadow-sm cursor-pointer"
				>
					<Tag class="w-4 h-4" />
					Add Tally
				</button>

				<div class="flex items-center gap-1 ml-auto">
					<button
						onclick={toggleThumbUp}
						class="p-2 rounded-lg transition-all {isThumbUp
							? 'bg-green-500/15 text-green-500 ring-1 ring-green-500/30'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'} cursor-pointer"
						aria-label="Good day"
					>
						<ThumbsUp
							class="w-5 h-5"
							fill={isThumbUp ? "currentColor" : "none"}
						/>
					</button>
					<button
						onclick={toggleThumbDown}
						class="p-2 rounded-lg transition-all {isThumbDown
							? 'bg-red-500/15 text-red-500 ring-1 ring-red-500/30'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'} cursor-pointer"
						aria-label="Bad day"
					>
						<ThumbsDown
							class="w-5 h-5"
							fill={isThumbDown ? "currentColor" : "none"}
						/>
					</button>
				</div>
			</div>

			<!-- Tally Chips -->
			{#if tallies.length > 0}
				<div class="pt-1">
					<h4 class="text-sm font-medium text-muted-foreground mb-2">
						Tally Marks
					</h4>
					<div class="flex flex-wrap gap-2">
						{#each tallies as tally, i}
							<span
								class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border {categoryColors[
									tally.type
								]} animate-scale-in"
							>
								{tally.type} &middot; {tally.text}
								<button
									onclick={() => removeTally(i)}
									class="hover:brightness-125 cursor-pointer"
									aria-label="Remove tally"
								>
									<X class="w-3.5 h-3.5" />
								</button>
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Submit -->
		<div class="px-5 sm:px-6 py-4 bg-muted/30 border-t border-border">
			<button
				onclick={submitEntry}
				class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all shadow-md hover:shadow-lg cursor-pointer"
			>
				<Save class="w-4 h-4" />
				Save Entry
			</button>
		</div>
	</div>
</div>

<TallyDialog bind:open={showTallyDialog} bind:tallies />

{#if showSuccess}
	<Toast message="Entry saved successfully!" ondismiss={() => (showSuccess = false)} />
{/if}
