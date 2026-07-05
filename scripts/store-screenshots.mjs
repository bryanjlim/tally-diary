// Generates app-store screenshots with mock data.
// Requires the production preview server: yarn build && yarn preview --port 4173
// Usage: node scripts/store-screenshots.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = 'store/screenshots';
mkdirSync(OUT, { recursive: true });

const day = (offset) => {
	const d = new Date();
	d.setDate(d.getDate() - offset);
	// Local date, not toISOString (UTC), so entries never land on "tomorrow"
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

let n = 0;
const entry = (offset, title, body, tallies, thumb) => ({
	id: `mock-${n++}`,
	title,
	date: day(offset),
	bodyText: body,
	tallies,
	isThumbUp: thumb === 'up',
	isThumbDown: thumb === 'down',
	entryNumber: 100 - n
});

const T = (type, text) => ({ type, text });

const ENTRIES = [
	entry(0, 'Hiked Mt. Tam with Sam', 'Perfect weather. We took the coastal trail and got burritos after — earned every bite. Legs are toast but the view from the top was unreal.', [T('Activity', 'Hiking'), T('Person', 'Sam'), T('Food', 'Chipotle'), T('Location', 'Mt. Tam')], 'up'),
	entry(1, 'Quiet reset day', 'Slept in, made pho from scratch, finished the last hundred pages of my book. Exactly the recharge day I needed.', [T('Activity', 'Reading'), T('Food', 'Pho'), T('Location', 'Home')], 'up'),
	entry(2, 'Shipped the redesign', 'Three weeks of work went live today. The team pulled it off without a single rollback. Celebratory ramen with everyone after.', [T('Other', 'Milestone'), T('Person', 'Work team'), T('Food', 'Ramen')], 'up'),
	entry(4, 'Long rainy workday', 'Back-to-back meetings and the rain never let up. Skipped the gym, ate leftovers at my desk. Tomorrow will be better.', [T('Location', 'Office'), T('Food', 'Leftovers')], 'down'),
	entry(5, 'Morning gym streak: week 3', 'Sixth session in a row. Finally hit a comfortable pace on the rower. Grabbed Chipotle with Alex on the way home.', [T('Activity', 'Gym'), T('Person', 'Alex'), T('Food', 'Chipotle')], 'up'),
	entry(7, 'Farmers market haul', 'Stocked up on tomatoes and fresh bread. Ran into Priya and caught up over coffee for two hours.', [T('Location', 'Farmers market'), T('Person', 'Priya'), T('Food', 'Coffee')], null),
	entry(9, 'Gym + meal prep', 'Leg day, then prepped lunches for the week. Future me says thanks.', [T('Activity', 'Gym'), T('Activity', 'Meal prep'), T('Location', 'Home')], null),
	entry(12, 'Dinner at the new ramen place', 'The tonkotsu lived up to the hype. Sam rated it a 9/10, and Sam is stingy with 9s.', [T('Food', 'Ramen'), T('Person', 'Sam'), T('Location', 'Downtown')], 'up'),
	entry(14, 'Reading in the park', 'Two chapters under a tree. A dog stole my spot when I got up. Fair.', [T('Activity', 'Reading'), T('Location', 'Park')], null),
	entry(16, 'Gym, then game night', 'Quick session after work, then board games at Alex’s. Lost Catan on the final turn. Rematch demanded.', [T('Activity', 'Gym'), T('Person', 'Alex'), T('Activity', 'Board games')], 'up'),
	entry(19, 'Chipotle council meeting', 'Monthly tradition with the college group chat. Attendance: perfect, as always.', [T('Food', 'Chipotle'), T('Person', 'College friends')], 'up'),
	entry(21, 'Slow work-from-home day', 'Focus was hard to find. Reset with a long walk and an early night.', [T('Location', 'Home'), T('Activity', 'Walking')], null),
	entry(24, 'Gym personal best', 'New deadlift PR. Wrote it on the fridge whiteboard like a trophy.', [T('Activity', 'Gym'), T('Other', 'PR')], 'up'),
	entry(27, 'Coffee with Priya', 'Talked about her move and the trip we keep not planning. October. We swore this time.', [T('Person', 'Priya'), T('Food', 'Coffee'), T('Location', 'Cafe')], null),
	entry(30, 'Monthly reflection', 'Twelve gym sessions, three books started, one finished. The tallies do not lie.', [T('Activity', 'Reading'), T('Activity', 'Gym'), T('Location', 'Home')], 'up'),
	entry(365, 'One year ago: moved into the new place', 'Boxes everywhere, pizza on the floor, and that feeling that everything was about to change. It did.', [T('Location', 'New apartment'), T('Food', 'Pizza'), T('Other', 'Moving day')], 'up')
];

const PREFS = { dateOfBirth: '1998-03-14', primaryTheme: 'dark' };

const DEVICES = [
	{ name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }, // 1170x2532 (Play)
	{ name: 'phone-65in', viewport: { width: 428, height: 926 }, deviceScaleFactor: 3 }, // 1284x2778 (App Store 6.5")
	{ name: 'tablet', viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 2 } // 2048x2732 (iPad 12.9" / Play tablet)
];

const browser = await chromium.launch();
for (const device of DEVICES) {
	const context = await browser.newContext({
		viewport: device.viewport,
		deviceScaleFactor: device.deviceScaleFactor,
		colorScheme: 'dark'
	});
	const page = await context.newPage();
	await page.addInitScript(
		(data) => {
			localStorage.setItem('tally-diary-entries', JSON.stringify(data.entries));
			localStorage.setItem('tally-diary-preferences', JSON.stringify(data.prefs));
			localStorage.setItem('tally-diary-theme-explicit', 'true');
		},
		{ entries: ENTRIES, prefs: PREFS }
	);

	const shot = async (name) => {
		await page.waitForTimeout(700); // let fade-in animations settle
		await page.screenshot({ path: `${OUT}/${device.name}-${name}.png` });
	};

	// 1. Add Entry — filled in so it looks alive
	await page.goto(BASE + '/');
	await page.getByPlaceholder('Give this day a title...').fill('Hiked Mt. Tam with Sam');
	await page.locator('#entry-body').fill('Perfect weather. We took the coastal trail and got burritos after — earned every bite.');
	for (const [cat, label] of [['Activity', 'Hiking'], ['Person', 'Sam'], ['Food', 'Chipotle']]) {
		await page.getByRole('button', { name: 'Add Tally' }).click();
		await page.getByRole('button', { name: cat, exact: true }).click();
		await page.getByPlaceholder('e.g., Chipotle, Running, Home...').fill(label);
		await page.getByRole('button', { name: 'Add', exact: true }).click();
		await page.getByRole('button', { name: 'Done' }).click();
	}
	await page.getByRole('button', { name: 'Good day' }).click();
	await shot('add-entry');

	// 2. Timeline
	await page.goto(BASE + '/timeline');
	await page.waitForSelector('text=Hiked Mt. Tam with Sam');
	await shot('timeline');

	// 3. Entry detail
	await page.goto(BASE + '/timeline/0');
	await page.waitForFunction(() => document.querySelector('input[placeholder="Title..."]')?.value);
	await shot('entry-detail');

	// 4. Insights — expand the two richest categories
	await page.goto(BASE + '/insights');
	await page.getByRole('button', { name: /^Activity/ }).click();
	await page.getByRole('button', { name: /^Food/ }).click();
	await shot('insights');

	await context.close();
	console.log(`${device.name}: 4 screenshots at ${device.viewport.width * device.deviceScaleFactor}x${device.viewport.height * device.deviceScaleFactor}`);
}
await browser.close();
