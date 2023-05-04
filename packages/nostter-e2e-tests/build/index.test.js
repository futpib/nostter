"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const puppeteer_1 = __importStar(require("puppeteer"));
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
const find_chrome_bin_1 = require("find-chrome-bin");
const semaphore_promise_1 = __importDefault(require("semaphore-promise"));
// @ts-expect-error
const reg_cli_1 = __importDefault(require("reg-cli"));
async function waitForFunction(name, page, f) {
    try {
        await page.waitForFunction(f);
    }
    catch (error) {
        await page.screenshot({
            path: node_path_1.default.join('screenshots', 'error', `${name}.png`),
            fullPage: true,
        });
        if (error instanceof puppeteer_1.TimeoutError) {
            error.message = `${error.message} (${name})`;
        }
        throw error;
    }
}
const test = ava_1.default;
const defaultNow = '2023-01-01T00:00:00.000Z';
const testCases = [
    {
        url: 'note1phg7k8mf8rq4e57uazxz26g0gus3qwpuxwhzguf0w787kxy6vnvqay3lna',
    },
    {
        url: 'npub1ye5ptcxfyyxl5vjvdjar2ua3f0hynkjzpx552mu5snj3qmx5pzjscpknpr',
    },
];
test.before(async (t) => {
    const testCaseSemaphore = new semaphore_promise_1.default(4, {
        name: 'testCase',
    });
    Object.assign(t.context, {
        testCaseSemaphore,
    });
});
test.before(async (t) => {
    const chrome = await (0, find_chrome_bin_1.findChrome)({});
    console.log(chrome);
    const browser = await puppeteer_1.default.launch({
        headless: 'new',
        executablePath: chrome.executablePath,
    });
    const browserSemaphore = new semaphore_promise_1.default(2, {
        name: 'browser',
    });
    Object.assign(t.context, {
        browser,
        browserSemaphore,
    });
});
test.before(async (t) => {
    const actualScreenshotDirectory = node_path_1.default.join('screenshots', 'actual');
    const expectedScreenshotDirectory = node_path_1.default.join('screenshots', 'expected');
    const errorScreenshotDirectory = node_path_1.default.join('screenshots', 'error');
    await Promise.all([
        actualScreenshotDirectory,
        expectedScreenshotDirectory,
        errorScreenshotDirectory,
    ].map(directory => promises_1.default.mkdir(directory, { recursive: true })));
    Object.assign(t.context, {
        actualScreenshotDirectory,
        expectedScreenshotDirectory,
        errorScreenshotDirectory,
    });
});
test.beforeEach(async (t) => {
    const { testCaseSemaphore, browser, browserSemaphore, } = t.context;
    const releaseTestCaseSemaphore = await testCaseSemaphore.acquire();
    async function withPage(f) {
        const releaseBrowserSemaphore = await browserSemaphore.acquire();
        const page = await browser.newPage();
        try {
            await f(page);
        }
        finally {
            releaseBrowserSemaphore();
            await page.close();
        }
    }
    ;
    Object.assign(t.context, {
        releaseTestCaseSemaphore,
        withPage,
    });
});
const runTestCase = async (t, { url, now = defaultNow }, { screenshotDirectory, baseUrl, skipServerRendering, }) => {
    const { withPage } = t.context;
    await withPage(async (page) => {
        const url_ = new URL(url, baseUrl);
        url_.searchParams.set('now', now);
        url_.searchParams.set('skipServerRendering', String(skipServerRendering));
        console.log(url_.toString());
        await page.goto(url_.toString(), {
            waitUntil: 'networkidle2',
        });
        await waitForFunction('no skeletons', page, () => {
            const skeletons = window.document.querySelectorAll('[date-test-name$="Skeleton"]');
            return skeletons.length === 0;
        });
        await page.evaluate(async () => {
            for (const image of window.document.querySelectorAll('img[src$=".gif"]')) {
                if (!(image instanceof HTMLImageElement)) {
                    throw new Error('image is not HTMLImageElement');
                }
                if (image.crossOrigin !== 'anonymous') {
                    image.crossOrigin = 'anonymous';
                }
                await new Promise(resolve => {
                    image.addEventListener('load', resolve);
                });
                const canvas = window.document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                if (context === null) {
                    throw new Error('context is null');
                }
                context.drawImage(image, 0, 0);
                image.src = canvas.toDataURL();
                await new Promise(resolve => {
                    image.addEventListener('load', resolve);
                });
            }
        });
        const screenshotPath = node_path_1.default.join(screenshotDirectory, [
            url,
            now,
            skipServerRendering ? 'client' : 'server',
        ].join('.') + '.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true,
        });
    });
};
const testCaseMacro = {
    async exec(t, testCase, { skipServerRendering }) {
        const { actualScreenshotDirectory, expectedScreenshotDirectory, } = t.context;
        await Promise.all([
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
test.afterEach.always(async (t) => {
    const { releaseTestCaseSemaphore } = t.context;
    releaseTestCaseSemaphore();
});
test.after.always(async (t) => {
    const { actualScreenshotDirectory, expectedScreenshotDirectory } = t.context;
    const observer = (0, reg_cli_1.default)({
        actualDir: actualScreenshotDirectory,
        expectedDir: expectedScreenshotDirectory,
        diffDir: node_path_1.default.join('screenshots', 'diff'),
        report: node_path_1.default.join('screenshots', 'report.html'),
        json: node_path_1.default.join('screenshots', 'report.json'),
    });
    const result = await new Promise((resolve, reject) => {
        observer.on('error', reject);
        observer.on('complete', resolve);
    });
    t.deepEqual(result.failedItems, []);
});
