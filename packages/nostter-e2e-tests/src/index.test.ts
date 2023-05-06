import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import puppeteer, { Browser, Page, TimeoutError } from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { findChrome } from 'find-chrome-bin';
import Semaphore from 'semaphore-promise';
// @ts-expect-error
import regCli from 'reg-cli';

async function waitForFunction(name: string, page: Page, f: () => boolean) {
	try {
		await page.waitForFunction(f);
	} catch (error) {
		await page.screenshot({
			path: path.join('screenshots', 'error', `${name}.png`),
			fullPage: true,
		});

		if (error instanceof TimeoutError) {
			error.message = `${error.message} (${name})`;
		}

		throw error;
	}
}

type TestContext = {
	testCaseSemaphore: Semaphore;
	releaseTestCaseSemaphore: () => void;

	browser: Browser;
	browserSemaphore: Semaphore;

	withPage: (f: (page: Page) => Promise<void>) => Promise<void>;

	actualScreenshotDirectory: string;
	expectedScreenshotDirectory: string;
	errorScreenshotDirectory: string;
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
	// {
	// 	url: 'npub1ye5ptcxfyyxl5vjvdjar2ua3f0hynkjzpx552mu5snj3qmx5pzjscpknpr',
	// },
	{
		title: 'without profile info',
		url: 'npub1s7ehx4ynuzvyqm275zsazd9y5y5qdm4sy09wz9pzdcnnva20nxlsgf5s44',
	},
];

test.before(async t => {
	const testCaseSemaphore = new Semaphore(4, {
		name: 'testCase',
	});

	Object.assign(t.context, {
		testCaseSemaphore,
	});
});

test.before(async t => {
	const chrome = await findChrome({});

	console.log(chrome);

	const browser = await puppeteer.launch({
		headless: 'new',
		executablePath: chrome.executablePath,
	});

	const browserSemaphore = new Semaphore(2, {
		name: 'browser',
	});

	Object.assign(t.context, {
		browser,
		browserSemaphore,
	});
});

test.before(async t => {
	const actualScreenshotDirectory = path.join('screenshots', 'actual');
	const expectedScreenshotDirectory = path.join('screenshots', 'expected');
	const errorScreenshotDirectory = path.join('screenshots', 'error');

	await Promise.all(
		[
			actualScreenshotDirectory,
			expectedScreenshotDirectory,
			errorScreenshotDirectory,
		].map(directory => fs.mkdir(directory, { recursive: true }))
	);

	Object.assign(t.context, {
		actualScreenshotDirectory,
		expectedScreenshotDirectory,
		errorScreenshotDirectory,
	});
});

test.beforeEach(async t => {
	const {
		testCaseSemaphore,

		browser,
		browserSemaphore,
	} = t.context;

	const releaseTestCaseSemaphore = await testCaseSemaphore.acquire();

	async function withPage(f: (page: Page) => Promise<void>) {
		const releaseBrowserSemaphore = await browserSemaphore.acquire();
		const page = await browser.newPage();

		try {
			await f(page);
		} finally {
			releaseBrowserSemaphore();
			await page.close();
		}
	};

	Object.assign(t.context, {
		releaseTestCaseSemaphore,

		withPage,
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
	const { withPage } = t.context;

	await withPage(async page => {
		const url_ = new URL(url, baseUrl);
		url_.searchParams.set('now', now);
		url_.searchParams.set('skipServerRendering', String(skipServerRendering));

		console.log(url_.toString());

		await page.goto(url_.toString(), {
			waitUntil: 'networkidle2',
		});

		await waitForFunction('no skeletons', page, () => {
			const skeletons = window.document.querySelectorAll('[date-test-name$="Skeleton"]')

			return skeletons.length === 0;
		});

		await page.evaluate(async () => {
			for (const image of window.document.querySelectorAll('img[src$=".gif"]')) {
				if (!(image instanceof HTMLImageElement)) {
					throw new Error('image is not HTMLImageElement');
				}

				if (image.crossOrigin !== 'anonymous') {
					image.crossOrigin = 'anonymous';

					await new Promise(resolve => {
						image.addEventListener('load', resolve);
					});
				}

				const canvas = window.document.createElement('canvas');

				canvas.width = image.width;
				canvas.height = image.height;

				const context = canvas.getContext('2d');

				if (context === null) {
					throw new Error('context is null');
				}

				context.drawImage(image, 0, 0, image.width, image.height);

				image.src = canvas.toDataURL();

				await new Promise(resolve => {
					image.addEventListener('load', resolve);
				});
			}
		});

		const screenshotPath = path.join(screenshotDirectory, [
			url,
			now.replaceAll(':', '_'),
			skipServerRendering ? 'client' : 'server',
		].join('.') + '.png');

		await page.screenshot({
			path: screenshotPath,
			fullPage: true,
		});
	});
}

const testCaseMacro: Macro<[ TestCase, { skipServerRendering: boolean } ], TestContext> = {
	async exec(t: ExecutionContext<TestContext>, testCase: TestCase, { skipServerRendering }) {
		const {
			actualScreenshotDirectory,
			expectedScreenshotDirectory,
		} = t.context;

		await Promise.all([
			runTestCase(t, testCase, {
				screenshotDirectory: actualScreenshotDirectory,
				baseUrl: 'https://nostter-git-master-futpib.vercel.app',
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

test.afterEach.always(async t => {
	const { releaseTestCaseSemaphore } = t.context;

	releaseTestCaseSemaphore();
});

test.after.always(async t => {
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
