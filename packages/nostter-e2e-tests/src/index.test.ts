import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import puppeteer, { Browser, Page, TimeoutError } from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { findChrome } from 'find-chrome-bin';
import Semaphore from 'semaphore-promise';
// @ts-expect-error
import regCli from 'reg-cli';

const viewportSizes = {
	xs: { width: 320, height: 568 },
	sm: { width: 768, height: 1024 },
	md: { width: 1024, height: 768 },
	lg: { width: 1280, height: 800 },
};

type ViewportSizeName = keyof typeof viewportSizes;

function pathEscape(path: string) {
	return path.replaceAll(/[\/:?]/g, '_');
}

async function waitForFunction(t: ExecutionContext<TestContext>, name: string, page: Page, f: () => boolean) {
	try {
		await page.waitForFunction(f);
	} catch (error) {
		await page.screenshot({
			path: path.join('screenshots', 'error', pathEscape(`${t.title}.${name}.png`)),
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
	page: Page;

	actualScreenshotDirectory: string;
	expectedScreenshotDirectory: string;
	errorScreenshotDirectory: string;
};

const test = anyTest as TestFn<TestContext>;

const defaultNow = '2023-01-01T00:00:00.000Z';
const defaultViewportSizes = {
	xs: true,
	sm: true,
	md: true,
	lg: true,
};

type TestCase = Readonly<{
	title?: string;
	url: string;
	now?: string;
	screenshotFullPage?: false;
	testViewportSize?: ViewportSizeName;
	screenshotViewportSizes?: Partial<Record<ViewportSizeName, boolean>>;
	exec?: (t: ExecutionContext<TestContext>) => Promise<void>;
}>;

function compareByUrl(a: TestCase, b: TestCase) {
	return a.url.localeCompare(b.url);
}

const testCases_: TestCase[] = [
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
		title: 'preview for page without siteName',
		url: 'note1wpt8p05x0ue5flp7jx4n8wrae7eklcs7xwf9a8fngg5nhkh8va2sunlnhw',
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
		screenshotFullPage: false,
	},
	{
		title: 'all notes',
		url: '',
	},
	{
		title: 'search notes',
		url: 'search?q=%23bitcoin',
	},
	{
		title: 'jack\'s following',
		url: 'npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m/following',
	},
	{
		title: 'jack\'s drawer',
		url: 'npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m',
		testViewportSize: 'xs',
		screenshotViewportSizes: {
			xs: true,
		},
		screenshotFullPage: false,
		exec: async t => {
			const { page } = t.context;

			await page.waitForSelector('[data-test-name="HeaderXsAccountButton"]', { visible: true });

			await page.click('[data-test-name="HeaderXsAccountButton"]');

			await page.waitForSelector('[data-test-name="DrawerXs"]', { visible: true });
		},
	},
	{
		title: 'long web page description',
		url: 'note10ymnz7td87kyunm528wkvdr9vxh87cq0mtknc9uw20gs9p97t4tshq0643',
	},
];

const testCases = testCases_.slice().sort(compareByUrl);

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

		t.context.page = page;

		try {
			await f(page);
		} finally {
			releaseBrowserSemaphore();
			t.context.page = undefined as any;
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
	{
		url,
		now = defaultNow,
		screenshotFullPage,
		testViewportSize,
		screenshotViewportSizes = defaultViewportSizes,
		exec,
	}: TestCase,
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
		await page.setViewport(viewportSizes[testViewportSize ?? 'lg']);

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

		await exec?.(t);

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

		for (const [ sizeName, { width, height } ] of Object.entries(viewportSizes)) {
			if (!screenshotViewportSizes[sizeName as ViewportSizeName]) {
				continue;
			}

			const screenshotPath = path.join(screenshotDirectory, pathEscape([
				url || 'index',
				now,
				skipServerRendering ? 'client' : 'server',
				sizeName,
			].join('.') + '.png'));

			const releaseBrowserScreenshotSemaphore = await browserScreenshotSemaphore.acquire();

			try {
				await page.bringToFront();
				await page.setViewport({ width, height });
				await page.screenshot({
					path: screenshotPath,
					fullPage: screenshotFullPage === false ? false : true,
				});
			} finally {
				releaseBrowserScreenshotSemaphore();
			}
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

test.todo('login and like + unlike a note');

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
