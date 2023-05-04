import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import puppeteer, { Browser } from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs/promises';
// @ts-expect-error
import regCli from 'reg-cli';

type TestContext = {
	browser: Browser;

	actualScreenshotDirectory: string;
	expectedScreenshotDirectory: string;
};

const test = anyTest as TestFn<TestContext>;

const defaultNow = '2023-01-01T00:00:00.000Z';

type TestCase = {
	url: string;
	now?: string;
};

const testCases = [
	{
		url: 'note1phg7k8mf8rq4e57uazxz26g0gus3qwpuxwhzguf0w787kxy6vnvqay3lna',
	},
	{
		url: 'npub1ye5ptcxfyyxl5vjvdjar2ua3f0hynkjzpx552mu5snj3qmx5pzjscpknpr',
	},
];

test.before(async t => {
	t.context.browser = await puppeteer.launch({
		headless: 'new',
	});
});

test.before(async t => {
	const actualScreenshotDirectory = path.join('screenshots', 'actual');
	const expectedScreenshotDirectory = path.join('screenshots', 'expected');

	await Promise.all(
		[
			actualScreenshotDirectory,
			expectedScreenshotDirectory,
		].map(directory => fs.mkdir(directory, { recursive: true }))
	);

	Object.assign(t.context, {
		actualScreenshotDirectory,
		expectedScreenshotDirectory,
	});
});

const runTestCase = async (
	t: ExecutionContext<TestContext>,
	{ url, now = defaultNow }: TestCase,
	{
		screenshotDirectory,
		baseUrl,
		skipServerRendering,
	}: {
		screenshotDirectory: string;
		baseUrl: string;
		skipServerRendering: boolean;
	},
) => {
	const { browser } = t.context;

	const page = await browser.newPage();

	const url_ = new URL(url, baseUrl);
	url_.searchParams.set('now', now);
	url_.searchParams.set('skipServerRendering', String(skipServerRendering));

	await page.goto(url_.toString(), {
		waitUntil: 'networkidle2',
	});

	const screenshotPath = path.join(screenshotDirectory, [
		url,
		now,
		skipServerRendering ? 'client' : 'server',
	].join('.') + '.png');

	await page.screenshot({
		path: screenshotPath,
		fullPage: true,
	});

	return {
		screenshotPath,
	};
}

const testCaseMacro: Macro<[ TestCase, { skipServerRendering: boolean } ], TestContext> = {
	async exec(t: ExecutionContext<TestContext>, testCase: TestCase, { skipServerRendering }) {
		const {
			actualScreenshotDirectory,
			expectedScreenshotDirectory,
		} = t.context;

		const [
			actualResult,
			expectedResult,
		] = await Promise.all([
			runTestCase(t, testCase, {
				screenshotDirectory: actualScreenshotDirectory,
				baseUrl: 'https://master-nostter-futpib.vercel.app',
				skipServerRendering,
			}),
			runTestCase(t, testCase, {
				screenshotDirectory: expectedScreenshotDirectory,
				baseUrl: 'https://nostter.com',
				skipServerRendering,
			}),
		]);

		t.pass();
	},

	title(_, { url, now = defaultNow }, { skipServerRendering }) {
		return `${url} at ${now} (${skipServerRendering ? 'client rendering' : 'server rendering'})`;
	},
};

for (const testCase of testCases) {
	test(testCaseMacro, testCase, { skipServerRendering: false });
	test(testCaseMacro, testCase, { skipServerRendering: true });
}

test.after(async t => {
	const { actualScreenshotDirectory, expectedScreenshotDirectory } = t.context;

	const observer = regCli({
		actualDir: actualScreenshotDirectory,
		expectedDir: expectedScreenshotDirectory,
		diffDir: path.join('screenshots', 'diff'),
		report: path.join('screenshots', 'report.html'),
		json: path.join('screenshots', 'report.json'),
	});

	const result = await new Promise<{
		failedItems: string[];
	}>((resolve, reject) => {
		observer.on('error', reject);
		observer.on('complete', resolve);
	});

	t.deepEqual(result.failedItems, []);
});
