<script lang="ts">
	import '../app.css';
	import { store } from '$lib/stores.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { trySilentMigration } from '$lib/migrate';
	import { Plus, BookOpen, PieChart, Settings, Menu, X, Sun, Moon, Cloud, CloudOff, Loader2, LogOut } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
	let mobileOpen = $state(false);

	// Theme: read from device preference, allow manual override
	function getInitialTheme(): 'light' | 'dark' {
		if (!browser) return 'dark';
		const hasExplicitPref = localStorage.getItem('tally-diary-theme-explicit');
		if (hasExplicitPref) {
			const stored = store.preferences.primaryTheme;
			if (stored === 'light' || stored === 'dark') return stored;
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	let theme = $state<'light' | 'dark'>(getInitialTheme());

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}
	});

	// Listen for device theme changes
	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			const hasExplicitPref = localStorage.getItem('tally-diary-theme-explicit');
			if (!hasExplicitPref) {
				theme = e.matches ? 'dark' : 'light';
			}
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		store.updatePreferences({ primaryTheme: theme });
		if (browser) localStorage.setItem('tally-diary-theme-explicit', 'true');
	}

	// Google sign-in
	let signingIn = $state(false);

	// Auto-sync on app load for returning users
	$effect(() => {
		if (!browser) return;
		// Try silent re-auth (no popup) — only for users who previously signed in
		store.trySilentSignIn().then(async (ok) => {
			if (ok) {
				// Also run migration in case Phase 2 was interrupted
				const result = await trySilentMigration();
				if (result && result.prefs) {
					theme = store.preferences.primaryTheme || getInitialTheme();
				}
			}
		});
	});

	async function handleSignIn() {
		signingIn = true;
		const ok = await store.signIn();
		signingIn = false;
		if (ok) {
			// Run migration after sign-in (converts old format if needed)
			const result = await trySilentMigration();
			if (result && result.prefs) {
				theme = store.preferences.primaryTheme || getInitialTheme();
			}
		}
	}

	function handleSignOut() {
		store.signOut();
	}

	const navItems = [
		{ href: '/', label: 'Add Entry', icon: Plus },
		{ href: '/timeline', label: 'My Entries', icon: BookOpen },
		{ href: '/insights', label: 'Insights', icon: PieChart },
		{ href: '/settings', label: 'Settings', icon: Settings },
	];

	function navigate(href: string) {
		goto(href);
		mobileOpen = false;
	}

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Tally Diary</title>
	<meta name="description" content="A diary that helps you tally your life" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="flex h-screen overflow-hidden transition-theme">
	<!-- Desktop Sidebar -->
	<aside class="hidden md:flex md:flex-col md:w-64 border-r border-sidebar-border bg-sidebar shrink-0">
		<div class="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
			<img src="/logo.png" alt="Tally Diary" class="w-8 h-8 rounded-lg" />
			<h1 class="text-lg font-bold text-primary">
				Tally Diary
			</h1>
		</div>
		<nav class="flex-1 py-4 px-3 space-y-1">
			{#each navItems as item}
				<button
					onclick={() => navigate(item.href)}
					class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
						{isActive(item.href) 
							? 'bg-primary/10 text-primary shadow-sm' 
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
				>
					<item.icon class="w-5 h-5" />
					{item.label}
				</button>
			{/each}
		</nav>
		<div class="p-3 border-t border-sidebar-border space-y-1">
			<!-- Google Drive status -->
			{#if store.signedIn}
				<div class="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
					{#if store.syncing}
						<Loader2 class="w-3.5 h-3.5 animate-spin text-primary" />
						<span>Syncing...</span>
					{:else}
						<Cloud class="w-3.5 h-3.5 text-green-500" />
						<span>Google Drive connected</span>
					{/if}
				</div>
				<button
					onclick={handleSignOut}
					class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full cursor-pointer"
				>
					<LogOut class="w-4 h-4" />
					<span>Sign Out</span>
				</button>
			{:else}
				<button
					onclick={handleSignIn}
					disabled={signingIn}
					class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full cursor-pointer disabled:opacity-50"
				>
					{#if signingIn}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>Signing in...</span>
					{:else}
						<CloudOff class="w-4 h-4" />
						<span>Sign in with Google</span>
					{/if}
				</button>
			{/if}
			<!-- Theme toggle -->
			<button
				onclick={toggleTheme}
				class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full cursor-pointer"
			>
				{#if theme === 'dark'}
					<Sun class="w-4 h-4" />
					<span>Light Mode</span>
				{:else}
					<Moon class="w-4 h-4" />
					<span>Dark Mode</span>
				{/if}
			</button>
		</div>
	</aside>

	<!-- Mobile Overlay -->
	{#if mobileOpen}
		<div class="fixed inset-0 z-40 md:hidden">
			<!-- Backdrop -->
			<button
				class="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onclick={() => mobileOpen = false}
				aria-label="Close menu"
			></button>
			<!-- Drawer -->
			<aside class="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border animate-slide-in shadow-2xl">
				<div class="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
					<div class="flex items-center gap-3">
						<img src="/logo.png" alt="Tally Diary" class="w-8 h-8 rounded-lg" />
						<h1 class="text-lg font-bold text-primary">
							Tally Diary
						</h1>
					</div>
					<button onclick={() => mobileOpen = false} class="p-1 rounded-md hover:bg-sidebar-accent cursor-pointer">
						<X class="w-5 h-5 text-sidebar-foreground" />
					</button>
				</div>
				<nav class="py-4 px-3 space-y-1">
					{#each navItems as item}
						<button
							onclick={() => navigate(item.href)}
							class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
								{isActive(item.href) 
									? 'bg-primary/10 text-primary' 
									: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
						>
							<item.icon class="w-5 h-5" />
							{item.label}
						</button>
					{/each}
				</nav>
				<div class="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border space-y-1">
					<!-- Google Drive status (mobile) -->
					{#if store.signedIn}
						<div class="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
							{#if store.syncing}
								<Loader2 class="w-3.5 h-3.5 animate-spin text-primary" />
								<span>Syncing...</span>
							{:else}
								<Cloud class="w-3.5 h-3.5 text-green-500" />
								<span>Drive connected</span>
							{/if}
						</div>
						<button
							onclick={handleSignOut}
							class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full cursor-pointer"
						>
							<LogOut class="w-4 h-4" />
							<span>Sign Out</span>
						</button>
					{:else}
						<button
							onclick={handleSignIn}
							disabled={signingIn}
							class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full cursor-pointer disabled:opacity-50"
						>
							{#if signingIn}
								<Loader2 class="w-4 h-4 animate-spin" />
								<span>Signing in...</span>
							{:else}
								<CloudOff class="w-4 h-4" />
								<span>Sign in with Google</span>
							{/if}
						</button>
					{/if}
					<!-- Theme toggle (mobile) -->
					<button
						onclick={toggleTheme}
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full cursor-pointer"
					>
						{#if theme === 'dark'}
							<Sun class="w-4 h-4" />
							<span>Light Mode</span>
						{:else}
							<Moon class="w-4 h-4" />
							<span>Dark Mode</span>
						{/if}
					</button>
				</div>
			</aside>
		</div>
	{/if}

	<!-- Main Content -->
	<div class="flex-1 flex flex-col min-w-0">
		<!-- Mobile Top Bar -->
		<header class="md:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
			<button
				onclick={() => mobileOpen = true}
				class="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
				aria-label="Open menu"
			>
				<Menu class="w-5 h-5" />
			</button>
			<div class="flex items-center gap-2">
				<img src="/logo.png" alt="" class="w-6 h-6 rounded" />
				<h1 class="text-lg font-bold text-primary">
					Tally Diary
				</h1>
			</div>
			<button
				onclick={toggleTheme}
				class="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
				aria-label="Toggle theme"
			>
				{#if theme === 'dark'}
					<Sun class="w-4 h-4" />
				{:else}
					<Moon class="w-4 h-4" />
				{/if}
			</button>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto">
			<div class="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
				{@render children()}
			</div>
		</main>
	</div>
</div>
