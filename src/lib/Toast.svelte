<script lang="ts">
	import { X } from 'lucide-svelte';

	let { message, ondismiss }: { message: string; ondismiss?: () => void } = $props();
</script>

<div class="fixed bottom-6 right-6 z-50 animate-fade-in">
	<div class="glass border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
		<div class="w-2 h-2 rounded-full bg-green-500"></div>
		<span class="text-sm font-medium text-foreground">{message}</span>
		{#if ondismiss}
			<button onclick={ondismiss} class="text-muted-foreground hover:text-foreground cursor-pointer">
				<X class="w-4 h-4" />
			</button>
		{/if}
	</div>
</div>
