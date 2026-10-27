"use strict";
/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const fs = require("fs");
const path = require("path");
const supertest = require("supertest");
const compile_middleware_1 = require("../compile-middleware");
const start_server_1 = require("../start_server");
const util_1 = require("./util");
chai.use(chaiAsPromised);
const assert = chai.assert;
const root = path.join(__dirname, '..', '..', 'test');
const userAgentsThatDontSupportES2015OrModules = [
    'unknown browser',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/14.99999',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.14986',
];
const chrome60UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3163.39 Safari/537.36';
const chrome66UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36';
const ie11UA = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
const firefox51UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:51.0) Gecko/20100101 Firefox/51.0';
const userAgentsThatSupportES2015AndModules = [
    chrome66UA,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1 Safari/605.1.15',
];
function readTestFile(p) {
    return fs.readFileSync(path.join(root, p)).toString();
}
suite('compile-middleware', () => {
    let app;
    suite('compilation', () => {
        setup(() => {
            app = start_server_1.getApp({
                root: root,
                compile: 'auto',
            });
            // Ensure a fresh cache for each test.
            compile_middleware_1.babelCompileCache.reset();
        });
        test('compiles ES2015', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app).get('/compilation/class.js');
            assert.notInclude(response.text, 'class A {}', 'Did not compile');
        }));
        test('does not compile ES2015', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/class.js')
                .set('User-Agent', chrome60UA);
            assert.include(response.text, 'class A {}', 'compiled');
        }));
        test('compiles ES2016', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/exponentiation.js')
                .set('User-Agent', ie11UA);
            assert.notInclude(response.text, '2 ** 5', 'compiled');
        }));
        test('does not compiles ES2016', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/exponentiation.js')
                .set('User-Agent', chrome60UA);
            assert.include(response.text, '2 ** 5', 'Did not compile');
        }));
        test('compiles ES2017 to ES5', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/async.js')
                .set('User-Agent', ie11UA);
            assert.notInclude(response.text, 'async function foo()', 'compiled');
        }));
        test('compiles ES2017 to ES2015', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/async.js')
                .set('User-Agent', firefox51UA);
            assert.notInclude(response.text, 'regeneratorRuntime', 'included regeneratorRuntime');
            assert.notInclude(response.text, 'async function foo()', 'compiled');
        }));
        test('does not compile ES2017', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/async.js')
                .set('User-Agent', chrome60UA);
            assert.include(response.text, 'async function foo()', 'Did not compile');
        }));
        test('compiles ES2018', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/object-spread.js')
                .set('User-Agent', ie11UA);
            assert.notInclude(response.text, '...foo', 'compiled');
        }));
        test('does not compile ES2018', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield supertest(app)
                .get('/compilation/object-spread.js')
                .set('User-Agent', chrome66UA);
            assert.include(response.text, '...foo', 'Did not compile');
        }));
    });
    suite('babelCompileCache', () => {
        const uncompiledHtml = readTestFile('bower_components/test-component/test.html');
        const uncompiledJs = readTestFile('bower_components/test-component/test.js');
        const options = { compileTarget: 'es5', transformModules: true };
        setup(() => {
            app = start_server_1.getApp({
                root: root,
                compile: 'always',
                componentDir: path.join(root, 'bower_components'),
            });
            // Ensure a fresh cache for each test.
            compile_middleware_1.babelCompileCache.reset();
        });
        test('caches html compilation results', () => __awaiter(this, void 0, void 0, function* () {
            const requestPath = '/components/test-component/test.html';
            const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledHtml, options);
            assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey));
            const response = yield supertest(app).get(requestPath).expect(200);
            assert.isTrue(compile_middleware_1.babelCompileCache.has(cacheKey));
            assert.equal(response.text, compile_middleware_1.babelCompileCache.get(cacheKey));
            assert.equal(response.text.indexOf('class A {}'), -1, 'Did not compile');
        }));
        test('returns cached html compilation results', () => __awaiter(this, void 0, void 0, function* () {
            const requestPath = '/components/test-component/test.html';
            const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledHtml, options);
            compile_middleware_1.babelCompileCache.set(cacheKey, 'IM IN UR CACHE');
            const response = yield supertest(app).get(requestPath);
            assert.equal(response.text, 'IM IN UR CACHE');
        }));
        test('caches javascript compilation results', () => __awaiter(this, void 0, void 0, function* () {
            const requestPath = '/components/test-component/test.js';
            const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledJs, options);
            assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey));
            const response = yield supertest(app).get(requestPath);
            assert.isTrue(compile_middleware_1.babelCompileCache.has(cacheKey));
            assert.equal(response.text, compile_middleware_1.babelCompileCache.get(cacheKey));
            assert.equal(response.text.indexOf('class A {}'), -1, 'Did not compile');
        }));
        test('returns cached js compilation results', () => __awaiter(this, void 0, void 0, function* () {
            const requestPath = '/components/test-component/test.js';
            const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledJs, options);
            compile_middleware_1.babelCompileCache.set(cacheKey, 'IM IN UR CACHE');
            const response = yield supertest(app).get(requestPath);
            assert.equal(response.text, 'IM IN UR CACHE');
        }));
        test('honors the cache max evicting least recently used', () => __awaiter(this, void 0, void 0, function* () {
            const requestPath = '/components/test-component/test.html';
            const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledHtml, options);
            yield supertest(app).get(requestPath);
            assert.isTrue(compile_middleware_1.babelCompileCache.has(cacheKey));
            const originalMax = compile_middleware_1.babelCompileCache['max'];
            compile_middleware_1.babelCompileCache['max'] = compile_middleware_1.babelCompileCache.length;
            try {
                // request a file not in the cache
                yield supertest(app).get('/components/test-component/test.js');
                assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey), 'cached html evicted');
            }
            finally {
                compile_middleware_1.babelCompileCache['max'] = originalMax;
            }
        }));
        test('script tags with invalid javascript are unchanged', () => __awaiter(this, void 0, void 0, function* () {
            const output = yield util_1.interceptOutput(() => __awaiter(this, void 0, void 0, function* () {
                const filePath = path.join(root, 'bower_components/compile-test/script-tags.html');
                const requestPath = '/components/compile-test/script-tags.html';
                const uncompiled = fs.readFileSync(filePath).toString();
                const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiled, options);
                assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey), 'Unexpected entry in cache');
                const response = yield supertest(app).get(requestPath);
                assert(compile_middleware_1.babelCompileCache.has(cacheKey), 'Missing cache entry');
                assert.include(response.text, `<script>\nthis is not valid\n</script>`);
                // The valid script tag should still be compiled.
                assert.notInclude(response.text, `<script>\nclass A {}\n</script>`);
            }));
            assert.include(output, 'failed to parse JavaScript');
        }));
        suite('with compile option set to \'auto\'', () => {
            setup(() => {
                app = start_server_1.getApp({
                    root: root,
                    compile: 'auto',
                    componentDir: path.join(root, 'bower_components'),
                });
                // Ensure a fresh cache for each test.
                compile_middleware_1.babelCompileCache.reset();
            });
            test('detect user-agents that do not need compilation', () => __awaiter(this, void 0, void 0, function* () {
                const requestPath = '/components/test-component/test.js';
                const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledJs, options);
                assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey), `Unexpected .js file in cache`);
                for (const userAgent of userAgentsThatSupportES2015AndModules) {
                    const response = yield supertest(app)
                        .get('/components/test-component/test.js')
                        .set('User-Agent', userAgent);
                    assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey), `Unexpected .js file in cache User-Agent ${userAgent}`);
                    assert.include(response.text, 'class A {}', `Unexpected compilation for User-Agent ${userAgent}`);
                    compile_middleware_1.babelCompileCache.reset();
                }
            }));
            test('detect user-agents that need compilation', () => __awaiter(this, void 0, void 0, function* () {
                const requestPath = '/components/test-component/test.js';
                const cacheKey = compile_middleware_1.getCompileCacheKey(requestPath, uncompiledJs, options);
                assert.isFalse(compile_middleware_1.babelCompileCache.has(cacheKey), `Unexpected .js file in cache`);
                for (const userAgent of userAgentsThatDontSupportES2015OrModules) {
                    const response = yield supertest(app)
                        .get('/components/test-component/test.js')
                        .set('User-Agent', userAgent);
                    assert.isTrue(compile_middleware_1.babelCompileCache.has(cacheKey), `Expected .js file in cache User-Agent ${userAgent}`);
                    assert.notInclude(response.text, 'class A {}', `Expected compilation for User-Agent ${userAgent}`);
                    compile_middleware_1.babelCompileCache.reset();
                }
            }));
        });
    });
    test('isPolyfill', () => {
        assert.isTrue(compile_middleware_1.isPolyfill.test('/webcomponentsjs/custom-elements-es5-adapter.js'));
        assert.isTrue(compile_middleware_1.isPolyfill.test('/webcomponentsjs/webcomponents-lite.js'));
        assert.isTrue(compile_middleware_1.isPolyfill.test('/bower_components/webcomponentsjs/webcomponents-lite.js'));
        assert.isFalse(compile_middleware_1.isPolyfill.test('/webcomponentsjs/tests/ce-import.html'));
        assert.isFalse(compile_middleware_1.isPolyfill.test('/webcomponentsjs/tests/imports/current-script.js'));
        assert.isFalse(compile_middleware_1.isPolyfill.test('/notwebcomponentsjs/webcomponents-lite.js'));
    });
    suite('module transformations', () => {
        setup(() => {
            app = start_server_1.getApp({
                root: root,
                compile: 'auto',
                componentDir: path.join(root, 'bower_components'),
            });
            compile_middleware_1.babelCompileCache.reset();
        });
        function assertGolden(filename) {
            return __awaiter(this, void 0, void 0, function* () {
                const goldenPath = path.join('bower_components', 'test-modules', 'golden', filename);
                const golden = readTestFile(goldenPath);
                const response = yield supertest(app)
                    .get('/components/test-modules/' + filename)
                    // Chrome 60 supports ES2015 but not modules.
                    .set('User-Agent', chrome60UA);
                if (process.env['UPDATE_POLYSERVE_GOLDENS']) {
                    fs.writeFileSync(path.join(root, goldenPath), response.text);
                    throw new Error('Goldens updated, test failing for your safety.');
                }
                assert.equal(response.text.trim(), golden.trim());
            });
        }
        test('transforms HTML with WCT', () => __awaiter(this, void 0, void 0, function* () {
            yield assertGolden('test-suite-wct.html');
        }));
        test('transforms HTML without WCT', () => __awaiter(this, void 0, void 0, function* () {
            yield assertGolden('test-suite-no-wct.html');
        }));
        test('does not transform HTML when nomodule script exists', () => __awaiter(this, void 0, void 0, function* () {
            yield assertGolden('test-suite-nomodule.html');
        }));
        test('transforms module-looking JS', () => __awaiter(this, void 0, void 0, function* () {
            yield assertGolden('lib-module.js');
        }));
        test('transforms non-module-looking JS', () => __awaiter(this, void 0, void 0, function* () {
            yield assertGolden('lib-no-module.js');
        }));
    });
    suite('module specifier rewriting', () => {
        const userAgent = chrome66UA;
        function assertGolden(requestPath, goldenPath) {
            return __awaiter(this, void 0, void 0, function* () {
                const golden = readTestFile(goldenPath);
                const response = yield supertest(app).get(requestPath).set('User-Agent', userAgent);
                // uncomment to update the golden:
                /**
                fs.writeFileSync(path.join(root, goldenPath), response.text);
                if (1 + 1 === 2) {
                  throw new Error('Goldens updated, test failing for your safety.');
                }
                */
                assert.equal(response.text.trim(), golden.trim());
            });
        }
        suite('from an unscoped, root package', () => {
            setup(() => {
                app = start_server_1.getApp({
                    root: path.join(root, 'npm-package'),
                    compile: 'never',
                    moduleResolution: 'node',
                    componentDir: 'node_modules',
                    packageName: 'an-npm-package',
                });
                compile_middleware_1.babelCompileCache.reset();
            });
            test('bare specifiers in scoped component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/an-npm-package/npm-module.js', 'golden/npm-package/npm-module.js');
            }));
            test('bare specifiers in scoped component HTML requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/an-npm-package/component.html', 'golden/npm-package/component.html');
            }));
            test('bare specifiers in app requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/app.js', 'golden/npm-package/app.js');
            }));
            test('bare specifiers in app HTML requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/index.html', 'golden/npm-package/index.html');
            }));
        });
        suite('from a scoped, root package', () => {
            setup(() => {
                app = start_server_1.getApp({
                    root: path.join(root, 'npm-package'),
                    compile: 'never',
                    moduleResolution: 'node',
                    componentDir: 'node_modules',
                    packageName: '@scope/an-npm-package',
                });
                compile_middleware_1.babelCompileCache.reset();
            });
            test('bare specifiers in scoped component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/@scope/an-npm-package/npm-module.js', 'golden/scoped-npm-package/npm-module.js');
            }));
            test('bare specifiers in scoped component HTML requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/@scope/an-npm-package/component.html', 'golden/scoped-npm-package/component.html');
            }));
            test('bare specifiers in app requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/app.js', 'golden/scoped-npm-package/app.js');
            }));
            test('bare specifiers in app HTML requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/index.html', 'golden/scoped-npm-package/index.html');
            }));
        });
        suite('between component packages', () => {
            setup(() => {
                app = start_server_1.getApp({
                    root: path.join(root, 'npm-package'),
                    compile: 'never',
                    moduleResolution: 'node',
                    componentDir: 'node_modules',
                    packageName: 'an-npm-package',
                });
                compile_middleware_1.babelCompileCache.reset();
            });
            test('bare specifiers in scoped component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/@polymer/test-component/test-module-1.js', 'golden/npm-package/node_modules/@polymer/test-component/test-module-1.js');
            }));
            test('bare specifiers in un-scoped component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/test-package/test-module-1.js', 'golden/npm-package/node_modules/test-package/test-module-1.js');
            }));
            test('bare + path specifiers in un-scoped component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/test-package/test-module-2.js', 'golden/npm-package/node_modules/test-package/test-module-2.js');
            }));
            test('bare specifiers in HTML in component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/@polymer/test-component/index.html', 'golden/npm-package/node_modules/@polymer/test-component/index.html');
            }));
            test('bare specifiers in index.html in component requests', () => __awaiter(this, void 0, void 0, function* () {
                yield assertGolden('/components/@polymer/test-component/', 'golden/npm-package/node_modules/@polymer/test-component/index.html');
            }));
        });
    });
});
//# sourceMappingURL=compile-middleware_test.js.map