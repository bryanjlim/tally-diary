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

test('insights shows streaks, good days, correlations, milestones, and heatmap', async ({ page }) => {
	// 14 consecutive days ending today: 10 thumbs-up, 4 thumbs-down.
	// 'Gym' appears on 5 of the thumbs-up days → strong positive correlation.
	const local = (offset: number) => {
		const d = new Date();
		d.setDate(d.getDate() - offset);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	};
	const days = Array.from({ length: 14 }, (_, i) => {
		const down = i % 4 === 3; // offsets 3, 7, 11 → 3 down… plus one more below
		return entry({
			title: `Day minus ${i}`,
			date: local(i),
			tallies: i % 2 === 0 && i < 10 ? [{ type: 'Activity', text: 'Gym' }] : [],
			isThumbUp: !down && i !== 13,
			isThumbDown: down || i === 13,
			entryNumber: 14 - i
		});
	});
	// Anniversary: same month/day, one year earlier
	const [y, m, d] = local(0).split('-');
	days.push(entry({ title: 'Last year today', date: `${Number(y) - 1}-${m}-${d}`, entryNumber: 0 }));
	await seed(page, days);

	await page.goto('/insights');
	// Streak: 14 consecutive days
	await expect(page.getByText('Longest: 14 days')).toBeVisible();
	// Good days: 10 up / 14 rated = 71% (exact — the correlations subtitle also mentions 71%)
	await expect(page.getByText('71%', { exact: true })).toBeVisible();
	// Correlation: Gym on 5 rated days, all thumbs-up → 100% good
	await expect(page.getByText('What Makes a Good Day')).toBeVisible();
	await expect(page.locator('#correlations').getByText('Gym')).toBeVisible();
	await expect(page.locator('#correlations').getByText('100% good')).toBeVisible();
	// Milestones & heatmap render
	await expect(page.getByText('Milestones')).toBeVisible();
	await expect(page.getByText(/entries until your/)).toBeVisible();
	await expect(page.getByTestId('heatmap')).toBeVisible();
	// Heatmap mode toggle: words-per-day gradient with its own legend, persisted
	await page.getByRole('button', { name: 'Words', exact: true }).click();
	await expect(page.getByText('More words')).toBeVisible();
	await page.reload();
	await expect(page.getByText('More words')).toBeVisible();
	// On This Day anniversary links to the entry
	await expect(page.getByText('1 year ago')).toBeVisible();
	await page.getByText('Last year today').click();
	await expect(page.getByPlaceholder('Title...')).toHaveValue('Last year today');
});

test('backup export/import round-trip does not duplicate entries', async ({ page }) => {
	await seed(page);
	await page.goto('/settings');

	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download Backup' }).click();
	const backup = await (await downloadPromise).path();

	// Re-importing your own backup must merge by id, not append duplicates
	await page.locator('input[type="file"]').setInputFiles(backup);
	await expect(page.getByText('Entries imported!')).toBeVisible();
	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tally-diary-entries') || '[]'));
	expect(stored).toHaveLength(3);

	// A genuinely new entry still imports — but only once, even if the file
	// itself contains the same id twice
	await page.evaluate(() => {
		const input = document.querySelector('input[type="file"]') as HTMLInputElement;
		const newEntry = { id: 'brand-new', title: 'New from file', date: '2026-06-20', bodyText: '', tallies: [], isThumbUp: false, isThumbDown: false, entryNumber: 4 };
		const file = new File(
			[JSON.stringify([newEntry, newEntry])],
			'extra.json',
			{ type: 'application/json' }
		);
		const dt = new DataTransfer();
		dt.items.add(file);
		input.files = dt.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});
	await expect(page.getByText('Entries imported!')).toBeVisible();
	const after = await page.evaluate(() => JSON.parse(localStorage.getItem('tally-diary-entries') || '[]'));
	expect(after).toHaveLength(4);
	expect(after.map((e: { id: string }) => e.id)).toContain('brand-new');
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
