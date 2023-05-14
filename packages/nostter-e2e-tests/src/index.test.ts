import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import puppeteer, { Browser, Page, TimeoutError } from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { findChrome } from 'find-chrome-bin';
import Semaphore from 'semaphore-promise';
// @ts-expect-error
import regCli from 'reg-cli';

function pathEscape(path: string) {
	return path.replaceAll(':', '_');
}

async function waitForFunction(t: ExecutionContext<TestContext>, name: string, page: Page, f: () => boolean) {
	try {
		await page.waitForFunction(f);
	} catch (error) {
		await page.screenshot({
			path: pathEscape(path.join('screenshots', 'error', `${t.title}.${name}.png`)),
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
	browserScreenshotSemaphore: Semaphore;

	withPage: (f: (page: Page) => Promise<void>) => Promise<void>;

	actualScreenshotDirectory: string;
	expectedScreenshotDirectory: string;
	errorScreenshotDirectory: string;
};

const test = anyTest as TestFn<TestContext>;

const defaultNow = '2023-01-01T00:00:00.000Z';

type TestCase = {
	title?: string;
	url: string;
	now?: string;
	fullPage?: false;
};

function compareByUrl(a: TestCase, b: TestCase) {
	return a.url.localeCompare(b.url);
}

const testCases = ([
	{
		url: 'note1phg7k8mf8rq4e57uazxz26g0gus3qwpuxwhzguf0w787kxy6vnvqay3lna',
	},
	{
		title: 'profile without a banner but with a picture',
		url: 'npub1ye5ptcxfyyxl5vjvdjar2ua3f0hynkjzpx552mu5snj3qmx5pzjscpknpr',
	},
	{
		title: 'single youtube link in the middle of content',
		url: 'note1xfkvxpw2yng3ckl239nrm2lj9du5wtx7a0hxcg40lqshksxluefs2d6npw'
	},
	{
		title: 'without profile info',
		url: 'npub1s7ehx4ynuzvyqm275zsazd9y5y5qdm4sy09wz9pzdcnnva20nxlsgf5s44',
	},
	{
		title: 'reposts',
		url: 'npub14ugy9d6t3yqvs88asezpz23qyduuy8m789zh88fnqz302dqsjj4qlu8jay',
		now: '2023-05-01T00:00:00.000Z',
	},
	{
		title: 'scroll keeping',
		url: 'note1x7g0je3c8szapk39yef0c86w7hxngdfhfauhce389sl6pjnwuwps4s8f6u',
		fullPage: false,
	},
	{
		title: 'all notes',
		url: '',
	},
	{
		title: 'search notes',
		url: 'search?q=%23bitcoin',
	},
] as const).slice().sort(compareByUrl);

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
		headless: process.env.PUPPETEER_HEADED ? false : 'new',
		executablePath: chrome.executablePath,
	});

	const browserSemaphore = new Semaphore(2, {
		name: 'browser',
	});

	const browserScreenshotSemaphore = new Semaphore(1, {
		name: 'browserScreenshot',
	});

	Object.assign(t.context, {
		browser,
		browserSemaphore,
		browserScreenshotSemaphore,
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
	{ url, now = defaultNow, fullPage }: TestCase,
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
	const { withPage, browserScreenshotSemaphore } = t.context;

	await withPage(async page => {
		const url_ = new URL(url, baseUrl);
		url_.searchParams.set('now', now);
		url_.searchParams.set('skipServerRendering', String(skipServerRendering));

		console.log(url_.toString());

		await page.goto(url_.toString(), {
			waitUntil: 'networkidle2',
		});

		await waitForFunction(t, 'no skeletons', page, () => {
			const skeletons = window.document.querySelectorAll('[data-test-name$="Skeleton"]');

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
			now,
			skipServerRendering ? 'client' : 'server',
		].join('.') + '.png');

		const releaseBrowserScreenshotSemaphore = await browserScreenshotSemaphore.acquire();

		try {
			await page.bringToFront();
			await page.screenshot({
				path: pathEscape(screenshotPath),
				fullPage: fullPage === false ? false : true,
			});
		} finally {
			releaseBrowserScreenshotSemaphore();
		}
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

	title(_, { title, url, now = defaultNow }, { skipServerRendering }) {
		return [
			title ? title + ': ' : '',
			url,
			' at ',
			now,
			' (',
			skipServerRendering ? 'client rendering' : 'server rendering',
			')',
		].join('');
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
