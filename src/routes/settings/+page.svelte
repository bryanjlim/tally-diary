<script lang="ts">
	import { store } from "$lib/stores.svelte";
	import Toast from "$lib/Toast.svelte";
	import { Download, Upload, Trash2, Calendar } from "lucide-svelte";

	let dateOfBirth = $state(store.preferences.dateOfBirth || "2000-01-01");
	let showSuccess = $state(false);
	let successMessage = $state("");
	let showDeleteConfirm = $state(false);
	let fileInput: HTMLInputElement;
	let successTimeout: ReturnType<typeof setTimeout>;

	function toast(msg: string) {
		successMessage = msg;
		showSuccess = true;
		clearTimeout(successTimeout);
		successTimeout = setTimeout(() => (showSuccess = false), 3000);
	}

	function saveSettings() {
		store.updatePreferences({ dateOfBirth });
		toast("Settings saved!");
	}

	function exportData() {
		const data = store.exportData();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "tally-diary-backup.json";
		a.click();
		URL.revokeObjectURL(url);
		toast("Backup downloaded!");
	}

	function handleImport() {
		fileInput?.click();
	}

	function onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const success = store.importData(reader.result as string);
			if (success) toast("Entries imported!");
			else toast("Error importing file");
		};
		reader.readAsText(file);
		input.value = "";
	}

	function deleteAllData() {
		store.deleteAllData();
		dateOfBirth = "2000-01-01";
		showDeleteConfirm = false;
		toast("All data deleted");
	}
</script>

<div class="animate-fade-in space-y-6">
	<div>
		<h2 class="text-2xl sm:text-3xl font-bold text-foreground">Settings</h2>
		<p class="text-muted-foreground mt-1">Manage your diary preferences</p>
	</div>

	<input
		type="file"
		accept=".json,application/json"
		class="hidden"
		bind:this={fileInput}
		onchange={onFileSelected}
	/>

	<!-- User Info -->
	<div class="rounded-xl border border-border bg-card overflow-hidden">
		<div class="p-5 border-b border-border">
			<h3 class="text-base font-semibold text-foreground">
				User Information
			</h3>
		</div>
		<div class="p-5 space-y-4">
			<div>
				<label
					for="dob"
					class="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1.5"
				>
					<Calendar class="w-4 h-4" /> Start / Birth Date
				</label>
				<input
					id="dob"
					type="date"
					bind:value={dateOfBirth}
					class="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
				/>
				<p class="text-xs text-muted-foreground mt-1">
					This is used to calculate your "Day X" in each entry
				</p>
			</div>
			<button
				onclick={saveSettings}
				class="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
			>
				Save Settings
			</button>
		</div>
	</div>

	<!-- Export & Import -->
	<div class="rounded-xl border border-border bg-card overflow-hidden">
		<div class="p-5 border-b border-border">
			<h3 class="text-base font-semibold text-foreground">
				Data Management
			</h3>
		</div>
		<div class="p-5 flex flex-wrap gap-3">
			<button
				onclick={exportData}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
			>
				<Download class="w-4 h-4" /> Download Backup
			</button>
			<button
				onclick={handleImport}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
			>
				<Upload class="w-4 h-4" /> Import Backup
			</button>
			{#if store.signedIn}
			<button
				onclick={async () => {
					toast('Merging data with Drive...');
					const ok = await store.forceSync();
					if (ok) toast('Successfully synced with Drive!');
					else toast('Drive sync failed. Try again.');
				}}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-sm font-medium transition-colors cursor-pointer"
			>
				<Upload class="w-4 h-4" /> Force Cloud Sync
			</button>
			{/if}
		</div>
	</div>

	<!-- Danger Zone -->
	<div
		class="rounded-xl border border-destructive/30 bg-destructive/5 overflow-hidden"
	>
		<div class="p-5 border-b border-destructive/20">
			<h3 class="text-base font-semibold text-destructive">
				Danger Zone
			</h3>
		</div>
		<div class="p-5">
			<p class="text-sm text-muted-foreground mb-3">
				Permanently delete all diary entries and preferences. This
				cannot be undone.
			</p>
			<button
				onclick={() => (showDeleteConfirm = true)}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
			>
				<Trash2 class="w-4 h-4" /> Delete All Data
			</button>
		</div>
	</div>
</div>

<!-- Delete Confirm Dialog -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={() => (showDeleteConfirm = false)}
			aria-label="Cancel"
		></button>
		<div
			class="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm animate-scale-in p-6 space-y-4"
		>
			<h3 class="text-lg font-semibold text-foreground">
				Delete Everything?
			</h3>
			<p class="text-sm text-muted-foreground">
				All diary entries and settings will be permanently deleted. This
				action cannot be undone.
			</p>
			<div class="flex gap-3 justify-end">
				<button
					onclick={() => (showDeleteConfirm = false)}
					class="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
					>Cancel</button
				>
				<button
					onclick={deleteAllData}
					class="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
					>Delete All</button
				>
			</div>
		</div>
	</div>
{/if}

{#if showSuccess}
	<Toast message={successMessage} ondismiss={() => (showSuccess = false)} />
{/if}
