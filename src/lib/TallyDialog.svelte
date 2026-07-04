<script lang="ts">
	import { TALLY_CATEGORIES, type TallyMark, type TallyCategory } from './types';

	let { open = $bindable(), tallies = $bindable() }: { open: boolean; tallies: TallyMark[] } = $props();

	let category = $state<TallyCategory>('Food');
	let text = $state('');
	let error = $state('');

	function add() {
		if (!text.trim()) {
			error = 'Please enter a label';
			return;
		}
		tallies = [...tallies, { type: category, text: text.trim() }];
		text = '';
		error = '';
	}

	function close() {
		open = false;
		error = '';
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={close} aria-label="Close"></button>
		<div class="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-scale-in p-6 space-y-4">
			<h3 class="text-lg font-semibold text-foreground">Add Tally Mark</h3>

			<div>
				<label for="tally-category" class="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
				<select
					id="tally-category"
					bind:value={category}
					class="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
				>
					{#each TALLY_CATEGORIES as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="tally-label" class="block text-sm font-medium text-muted-foreground mb-1.5">Label</label>
				<input
					id="tally-label"
					type="text"
					bind:value={text}
					placeholder="e.g., Chipotle, Running, Home..."
					class="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
					onkeydown={(e) => {
						if (e.key === 'Enter') add();
					}}
				/>
				{#if error}
					<p class="text-xs text-destructive mt-1">{error}</p>
				{/if}
			</div>

			<div class="flex gap-3 justify-end pt-2">
				<button
					onclick={close}
					class="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
				>
					Done
				</button>
				<button
					onclick={add}
					class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
				>
					Add
				</button>
			</div>
		</div>
	</div>
{/if}
