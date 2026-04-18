<script lang="ts">
	import { store } from "$lib/stores.svelte";
	import {
		TALLY_CATEGORIES,
		type DiaryEntry,
		type TallyMark,
		type TallyCategory,
		generateId,
	} from "$lib/types";
	import {
		Download,
		Upload,
		Trash2,
		Calendar,
		X,
		FileArchive,
		CheckCircle,
		AlertTriangle,
	} from "lucide-svelte";

	let dateOfBirth = $state(store.preferences.dateOfBirth || "2000-01-01");
	let showSuccess = $state(false);
	let successMessage = $state("");
	let showDeleteConfirm = $state(false);
	let fileInput: HTMLInputElement;
	let legacyFileInput: HTMLInputElement;
	let successTimeout: ReturnType<typeof setTimeout>;

	// Legacy import state
	let legacyResult = $state<{
		entries: number;
		prefs: boolean;
		warnings: string[];
	} | null>(null);
	let legacyError = $state("");

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

	// --- Legacy import ---

	function handleLegacyImport() {
		legacyResult = null;
		legacyError = "";
		legacyFileInput?.click();
	}

	function normalizeTally(raw: any): TallyMark | null {
		if (!raw || typeof raw !== "object") return null;
		const type = raw.type as string;
		const text = raw.text as string;
		if (!type || !text) return null;
		// Map to valid category or default to Other
		const validType = TALLY_CATEGORIES.includes(type as TallyCategory)
			? (type as TallyCategory)
			: "Other";
		return { type: validType, text };
	}

	function convertLegacyEntry(raw: any): {
		entry: DiaryEntry;
		warnings: string[];
	} {
		const warnings: string[] = [];

		// Handle date — the old app's updateDateString() added +1 to the day
		// Old dates look like "2019-05-02" but represent the day before
		let date = raw.date || "";
		if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
			// The old app added +1 day when saving, so subtract 1 to get the actual date
			const d = new Date(date + "T12:00:00");
			d.setDate(d.getDate() - 1);
			const corrected = d.toISOString().split("T")[0];
			if (corrected !== date) {
				warnings.push(
					`Date adjusted: ${date} → ${corrected} (old app +1 day offset)`,
				);
				date = corrected;
			}
		}

		// Normalize tallies
		const tallies: TallyMark[] = [];
		if (Array.isArray(raw.tallies)) {
			for (const t of raw.tallies) {
				const normalized = normalizeTally(t);
				if (normalized) tallies.push(normalized);
				else
					warnings.push(
						`Skipped invalid tally: ${JSON.stringify(t)}`,
					);
			}
		}

		return {
			entry: {
				id: generateId(),
				title: raw.title || raw.customTitle || "",
				date,
				bodyText: raw.bodyText || "",
				tallies,
				isThumbUp: !!raw.isThumbUp,
				isThumbDown: !!raw.isThumbDown,
				entryNumber: raw.entryNumber || 0,
			},
			warnings,
		};
	}

	function onLegacyFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		legacyResult = null;
		legacyError = "";

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const raw = JSON.parse(reader.result as string);
				const allWarnings: string[] = [];
				let entriesImported = 0;
				let prefsImported = false;

				if (Array.isArray(raw)) {
					// It's an entries array (the old backup.json format)
					for (const item of raw) {
						const { entry, warnings } = convertLegacyEntry(item);
						allWarnings.push(...warnings);
						store.addEntry(entry);
						entriesImported++;
					}
				} else if (typeof raw === "object") {
					// Could be user preferences (file "0") or a single entry
					if (
						raw.dateOfBirth ||
						raw.firstName ||
						raw.appLaunches !== undefined
					) {
						// It's user preferences
						if (raw.dateOfBirth) {
							dateOfBirth = raw.dateOfBirth;
							store.updatePreferences({
								dateOfBirth: raw.dateOfBirth,
								primaryTheme:
									raw.primaryTheme === "dark"
										? "dark"
										: "light",
							});
							prefsImported = true;
						}
					} else if (
						raw.bodyText !== undefined ||
						raw.tallies !== undefined
					) {
						// Single entry object
						const { entry, warnings } = convertLegacyEntry(raw);
						allWarnings.push(...warnings);
						store.addEntry(entry);
						entriesImported++;
					} else {
						legacyError =
							"Unrecognized file format. Expected an array of entries or a user preferences object.";
						input.value = "";
						return;
					}
				} else {
					legacyError = "Invalid JSON format.";
					input.value = "";
					return;
				}

				legacyResult = {
					entries: entriesImported,
					prefs: prefsImported,
					warnings: allWarnings,
				};
			} catch (e) {
				legacyError = `Failed to parse file: ${e instanceof Error ? e.message : "Unknown error"}`;
			}
		};
		reader.readAsText(file);
		input.value = "";
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
	<input
		type="file"
		accept=".json,application/json"
		class="hidden"
		bind:this={legacyFileInput}
		onchange={onLegacyFileSelected}
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

<!-- Success Toast -->
{#if showSuccess}
	<div class="fixed bottom-6 right-6 z-50 animate-fade-in">
		<div
			class="glass border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
		>
			<div class="w-2 h-2 rounded-full bg-green-500"></div>
			<span class="text-sm font-medium text-foreground"
				>{successMessage}</span
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
