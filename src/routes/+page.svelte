<script lang="ts">
	import { store } from "$lib/stores.svelte";
	import {
		TALLY_CATEGORIES,
		type TallyMark,
		type TallyCategory,
		generateId,
	} from "$lib/types";
	import { ThumbsUp, ThumbsDown, Plus, Save, X, Tag } from "lucide-svelte";

	let title = $state("");
	let date = $state(formatDateForInput(new Date()));
	let bodyText = $state("");
	let tallies = $state<TallyMark[]>([]);
	let isThumbUp = $state(false);
	let isThumbDown = $state(false);
	let showTallyDialog = $state(false);
	let tallyCategory = $state<TallyCategory>("Food");
	let tallyText = $state("");
	let tallyError = $state("");
	let showSuccess = $state(false);
	let successTimeout: ReturnType<typeof setTimeout>;

	function formatDateForInput(d: Date): string {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	}

	function getDaysAlive(): number {
		const dob = store.preferences.dateOfBirth;
		if (!dob) return 0;
		const diff = new Date(date + "T12:00:00").getTime() - new Date(dob + "T12:00:00").getTime();
		return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
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
		if (!tallyText.trim()) {
			tallyError = "Please enter a label";
			return;
		}
		tallies = [...tallies, { type: tallyCategory, text: tallyText.trim() }];
		tallyText = "";
		tallyError = "";
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

	const categoryColors: Record<TallyCategory, string> = {
		Food: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
		Activity:
			"bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
		Location:
			"bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
		Person: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
		Other: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
	};
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
						Day {getDaysAlive()}
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

<!-- Add Tally Dialog -->
{#if showTallyDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={() => (showTallyDialog = false)}
			aria-label="Close"
		></button>
		<div
			class="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-scale-in"
		>
			<div class="p-6 space-y-4">
				<h3 class="text-lg font-semibold text-foreground">
					Add Tally Mark
				</h3>

				<div>
					<label
						for="tally-category"
						class="block text-sm font-medium text-muted-foreground mb-1.5"
						>Category</label
					>
					<select
						id="tally-category"
						bind:value={tallyCategory}
						class="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
					>
						{#each TALLY_CATEGORIES as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="tally-label"
						class="block text-sm font-medium text-muted-foreground mb-1.5"
						>Label</label
					>
					<input
						id="tally-label"
						type="text"
						bind:value={tallyText}
						placeholder="e.g., Chipotle, Running, Home..."
						class="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
						onkeydown={(e) => {
							if (e.key === "Enter") addTally();
						}}
					/>
					{#if tallyError}
						<p class="text-xs text-destructive mt-1">
							{tallyError}
						</p>
					{/if}
				</div>

				<div class="flex gap-3 justify-end pt-2">
					<button
						onclick={() => {
							showTallyDialog = false;
							tallyError = "";
						}}
						class="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
					>
						Done
					</button>
					<button
						onclick={addTally}
						class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
					>
						Add
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Success Toast -->
{#if showSuccess}
	<div class="fixed bottom-6 right-6 z-50 animate-fade-in">
		<div
			class="glass border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
		>
			<div class="w-2 h-2 rounded-full bg-green-500"></div>
			<span class="text-sm font-medium text-foreground"
				>Entry saved successfully!</span
			>
			<button
				onclick={() => (showSuccess = false)}
				class="text-muted-foreground hover:text-foreground cursor-pointer"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>
{/if}
