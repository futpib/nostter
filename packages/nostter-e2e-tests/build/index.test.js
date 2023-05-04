"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
// @ts-expect-error
const reg_cli_1 = __importDefault(require("reg-cli"));
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
test.before((t) => __awaiter(void 0, void 0, void 0, function* () {
    t.context.browser = yield puppeteer_1.default.launch({
        headless: 'new',
    });
}));
test.before((t) => __awaiter(void 0, void 0, void 0, function* () {
    const actualScreenshotDirectory = node_path_1.default.join('screenshots', 'actual');
    const expectedScreenshotDirectory = node_path_1.default.join('screenshots', 'expected');
    yield Promise.all([
        actualScreenshotDirectory,
        expectedScreenshotDirectory,
    ].map(directory => promises_1.default.mkdir(directory, { recursive: true })));
    Object.assign(t.context, {
        actualScreenshotDirectory,
        expectedScreenshotDirectory,
    });
}));
const runTestCase = (t, { url, now = defaultNow }, { screenshotDirectory, baseUrl, skipServerRendering, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { browser } = t.context;
    const page = yield browser.newPage();
    const url_ = new URL(url, baseUrl);
    url_.searchParams.set('now', now);
    url_.searchParams.set('skipServerRendering', String(skipServerRendering));
    yield page.goto(url_.toString(), {
        waitUntil: 'networkidle2',
    });
    const screenshotPath = node_path_1.default.join(screenshotDirectory, [
        url,
        now,
        skipServerRendering ? 'client' : 'server',
    ].join('.') + '.png');
    yield page.screenshot({
        path: screenshotPath,
        fullPage: true,
    });
    return {
        screenshotPath,
    };
});
const testCaseMacro = {
    exec(t, testCase, { skipServerRendering }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { actualScreenshotDirectory, expectedScreenshotDirectory, } = t.context;
            const [actualResult, expectedResult,] = yield Promise.all([
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
        });
    },
    title(_, { url, now = defaultNow }, { skipServerRendering }) {
        return `${url} at ${now} (${skipServerRendering ? 'client rendering' : 'server rendering'})`;
    },
};
for (const testCase of testCases) {
    test(testCaseMacro, testCase, { skipServerRendering: false });
    test(testCaseMacro, testCase, { skipServerRendering: true });
}
test.after((t) => __awaiter(void 0, void 0, void 0, function* () {
    const { actualScreenshotDirectory, expectedScreenshotDirectory } = t.context;
    const observer = (0, reg_cli_1.default)({
        actualDir: actualScreenshotDirectory,
        expectedDir: expectedScreenshotDirectory,
        diffDir: node_path_1.default.join('screenshots', 'diff'),
        report: node_path_1.default.join('screenshots', 'report.html'),
        json: node_path_1.default.join('screenshots', 'report.json'),
    });
    const result = yield new Promise((resolve, reject) => {
        observer.on('error', reject);
        observer.on('complete', resolve);
    });
    t.deepEqual(result.failedItems, []);
}));
