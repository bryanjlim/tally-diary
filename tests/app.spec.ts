import { test, expect, type Page } from '@playwright/test';

type Tally = { type: string; text: string };

function entry(over: Partial<Record<string, unknown>> & { date: string }) {
	return {
		id: crypto.randomUUID(),
		title: 'Untitled',
		bodyText: '',
		tallies: [] as Tally[],
		isThumbUp: false,
		isThumbDown: false,
		entryNumber: 1,
		...over
	};
}

// Newest-first to match the store's date-descending sort
const SEED = [
	entry({ title: 'Burrito day', date: '2026-07-03', tallies: [{ type: 'Food', text: 'Chipotle' }], entryNumber: 3 }),
	entry({ title: 'Gym only', date: '2026-07-01', tallies: [{ type: 'Activity', text: 'Gym' }], entryNumber: 2 }),
	entry({ title: 'Both', date: '2026-06-28', tallies: [{ type: 'Food', text: 'Chipotle' }, { type: 'Activity', text: 'Gym' }], entryNumber: 1 })
];

async function seed(page: Page, entries = SEED) {
	await page.addInitScript((data) => {
		localStorage.setItem('tally-diary-entries', JSON.stringify(data));
		localStorage.setItem('tally-diary-preferences', JSON.stringify({ dateOfBirth: '2000-01-01', primaryTheme: 'dark' }));
	}, entries);
}

test('create an entry with a tally', async ({ page }) => {
	await page.goto('/');
	await page.getByPlaceholder('Give this day a title...').fill('Playwright day');
	await page.getByRole('button', { name: 'Add Tally' }).click();
	await page.getByRole('button', { name: 'Activity' }).click();
	await page.getByPlaceholder('e.g., Chipotle, Running, Home...').fill('Testing');
	await page.getByRole('button', { name: 'Add', exact: true }).click();
	await page.getByRole('button', { name: 'Done' }).click();
	await expect(page.getByText('Testing')).toBeVisible();
	await page.getByRole('button', { name: 'Save Entry' }).click();
	await expect(page.getByText('Entry saved successfully!')).toBeVisible();

	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tally-diary-entries') || '[]'));
	expect(stored).toHaveLength(1);
	expect(stored[0].title).toBe('Playwright day');
	expect(stored[0].tallies).toEqual([{ type: 'Activity', text: 'Testing' }]);
});

test('tally dialog rejects an empty label', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Add Tally' }).click();
	await page.getByRole('button', { name: 'Add', exact: true }).click();
	await expect(page.getByText('Please enter a label')).toBeVisible();
});

test('timeline filters entries by tally', async ({ page }) => {
	await seed(page);
	await page.goto('/timeline');
	await expect(page.getByText('3 entries')).toBeVisible();
	await page.getByRole('button', { name: 'Toggle filters' }).click();
	await page.getByPlaceholder('e.g., Chipotle').fill('Chipotle');
	await expect(page.getByText('2 entries')).toBeVisible();
	await expect(page.getByText('Burrito day')).toBeVisible();
	await expect(page.getByText('Gym only')).not.toBeVisible();
});

test('insights reverse-search links a tally to its entries', async ({ page }) => {
	await seed(page);
	await page.goto('/insights');
	await page.getByRole('button', { name: /^Food/ }).click();
	await page.getByRole('button', { name: /Chipotle/ }).click();
	await expect(page).toHaveURL(/\/timeline\?tally=Chipotle/);
	await expect(page.getByText('2 entries')).toBeVisible();
	await expect(page.getByText('Gym only')).not.toBeVisible();
});

test('edit page navigates between entries with correct data', async ({ page }) => {
	await seed(page);
	await page.goto('/timeline');
	await page.getByText('Burrito day').click();
	await expect(page.getByPlaceholder('Title...')).toHaveValue('Burrito day');

	// Regression: prev/next used to show the previous entry's data
	await page.getByRole('button', { name: 'Next entry' }).click();
	await expect(page.getByPlaceholder('Title...')).toHaveValue('Gym only');
	await page.getByRole('button', { name: 'Next entry' }).click();
	await expect(page.getByPlaceholder('Title...')).toHaveValue('Both');
	await page.getByRole('button', { name: 'Previous entry' }).click();
	await expect(page.getByPlaceholder('Title...')).toHaveValue('Gym only');

	await page.getByPlaceholder('Title...').fill('Gym only (edited)');
	await page.getByRole('button', { name: 'Update' }).click();
	await expect(page.getByText('Entry updated!')).toBeVisible();
	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tally-diary-entries') || '[]'));
	expect(stored.map((e: { title: string }) => e.title)).toContain('Gym only (edited)');
});

test('delete an entry with confirmation', async ({ page }) => {
	await seed(page);
	await page.goto('/timeline');
	await expect(page.getByText('3 entries')).toBeVisible();
	await page.getByRole('button', { name: 'Delete entry' }).first().click();
	await expect(page.getByRole('heading', { name: 'Delete Entry?' })).toBeVisible();
	await page.getByRole('button', { name: 'Delete', exact: true }).click();
	await expect(page.getByText('2 entries')).toBeVisible();
	await expect(page.getByText('Burrito day')).not.toBeVisible();
});

test('theme toggle switches palette and native color-scheme', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('tally-diary-theme-explicit', 'true');
		localStorage.setItem('tally-diary-preferences', JSON.stringify({ dateOfBirth: '2000-01-01', primaryTheme: 'dark' }));
	});
	await page.goto('/');
	await expect(page.locator('html')).toHaveClass(/dark/);
	// Desktop sidebar and (hidden) mobile drawer both render this control
	await page.getByRole('button', { name: 'Light Mode' }).first().click();
	await expect(page.locator('html')).not.toHaveClass(/dark/);
	expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('light');
});

test('app loads offline after first visit (service worker)', async ({ page, context }) => {
	await seed(page);
	await page.goto('/');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { name: 'New Entry' })).toBeVisible();
	await page.goto('/timeline');
	await expect(page.getByText('3 entries')).toBeVisible();
	await context.setOffline(false);
});
