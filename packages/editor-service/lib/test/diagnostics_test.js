"use strict";
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
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
const chai_1 = require("chai");
const fs_1 = require("fs");
const path = require("path");
const main_1 = require("vscode-languageserver/lib/main");
const util_1 = require("./util");
chai_1.use(require('chai-subset'));
const fixtureDir = path.join(__dirname, '..', '..', 'src', 'test', 'static');
suite('DiagnosticGenerator', function () {
    const indexPath = path.join('editor-service', 'index.html');
    test('For a good document we get no warnings', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexPath);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(indexPath), []);
        yield client.cleanup();
    }));
    test(`Warn on imports of files that aren't found.`, () => __awaiter(this, void 0, void 0, function* () {
        const { client, server, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        const indexContents = yield server.fileSynchronizer.urlLoader.load(client.converter.getAnalyzerUrl({ uri: indexPath }));
        const badImport = `<link rel="import" href="./does-not-exist.html">`;
        const badContents = `${badImport}\n\n${indexContents}`;
        yield client.openFile(indexPath, badContents);
        const diagnostics = yield client.getNextDiagnostics(indexPath);
        chai_1.assert.containSubset(diagnostics, [{ code: 'could-not-load', severity: main_1.DiagnosticSeverity.Error }]);
        chai_1.assert.deepEqual(yield underliner.underlineDiagnostics(diagnostics, indexPath), [`
<link rel="import" href="./does-not-exist.html">
                        ~~~~~~~~~~~~~~~~~~~~~~~`]);
        chai_1.assert.match(diagnostics[0].message, /Unable to load import:.*No such file/);
        // Closing the document without saving clears the diagnostics
        yield client.closeFile(indexPath);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(indexPath), []);
        // No more diagnostics
        yield util_1.assertDoesNotSettle(client.getNextDiagnostics(indexPath));
        yield client.cleanup();
    }));
    test(`Warn on imports of files that don't parse.`, () => __awaiter(this, void 0, void 0, function* () {
        const { client, server, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        const indexContents = yield server.fileSynchronizer.urlLoader.load(client.converter.getAnalyzerUrl({ uri: indexPath }));
        const badImport = `<script src="../js-parse-error.js"></script>`;
        const fileContents = `${badImport}\n\n${indexContents}`;
        yield client.openFile(indexPath, fileContents);
        const diagnostics = yield client.getNextDiagnostics(indexPath);
        chai_1.assert.containSubset(diagnostics, [{
                code: 'could-not-load',
                message: 'Unable to load import: Unexpected token (18:8)',
                severity: main_1.DiagnosticSeverity.Error,
            }]);
        chai_1.assert.deepEqual(yield underliner.underlineDiagnostics(diagnostics, indexPath), [`
<script src="../js-parse-error.js"></script>
            ~~~~~~~~~~~~~~~~~~~~~~`]);
        yield client.cleanup();
    }));
    test(`Warn on syntax errors in inline javascript documents`, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        const badScript = `\n<script>var var var var var let const;</script>`;
        yield client.openFile(indexPath, badScript);
        const diagnostics = yield client.getNextDiagnostics(indexPath);
        chai_1.assert.containSubset(diagnostics, [{
                code: 'parse-error',
                severity: main_1.DiagnosticSeverity.Error,
                message: `Unexpected keyword 'var'. (1:4)`,
            }]);
        chai_1.assert.deepEqual(yield underliner.underlineDiagnostics(diagnostics, indexPath), [`
<script>var var var var var let const;</script>
           ~`]);
        yield client.cleanup();
    }));
    let testName = `Do not warn on a sibling import ` +
        `if configured with a package url resolver`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const testBaseDir = path.join(fixtureDir, 'package-url-resolver');
        const { client } = yield util_1.createTestEnvironment({ fixtureDir: testBaseDir });
        yield client.openFile('simple-elem.html');
        // No warnings:
        chai_1.assert.deepEqual(yield client.getNextDiagnostics('simple-elem.html'), []);
        yield client.cleanup();
    }));
    testName = `Warn about parse errors in the file ` +
        `we're requesting errors for.`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const path = 'js-parse-error.js';
        yield client.openFile(path);
        const diagnostics = yield client.getNextDiagnostics(path);
        chai_1.assert.containSubset(diagnostics, [{
                code: 'parse-error',
                message: 'Unexpected token (18:8)',
                severity: main_1.DiagnosticSeverity.Error,
            }]);
        yield client.cleanup();
    }));
    test('changes in dependencies update cross-file warnings', () => __awaiter(this, void 0, void 0, function* () {
        // This is a regression test of a tricky bug that turned out to be in
        // the analyzer, but this is useful to assert that it still works.
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const basePath = 'base.js';
        const childPath = 'child.html';
        yield client.openFile(basePath, `
        class BaseElement extends HTMLElement {}
        customElements.define('vanilla-elem', BaseElement);
      `);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(basePath), []);
        yield client.openFile(childPath, `
        <script src="./base.js"></script>

        <script>
          class Child extends BaseElement {}
          customElements.define('child-elem', Child);
        </script>
      `);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(basePath), []);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(childPath), []);
        yield client.changeFile(basePath, `
        class VanEl extends HTMLElement {}
        customElements.define('vanilla-elem', VanEl);
      `);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(basePath), []);
        chai_1.assert.containSubset(yield client.getNextDiagnostics(childPath), [{ message: 'Could not resolve reference to class' }]);
        yield client.changeFile(basePath, `
        class BaseElement extends HTMLElement {}
        customElements.define('vanilla-elem', BaseElement);
      `);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(basePath), []);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics(childPath), []);
        yield client.cleanup();
    }));
    test('can be configured to filter out some warning codes', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment();
        yield client.openFile('index.html', `
      <link rel="import" href="nonexistant.html">
      <script>
        class Foo extends What {};
      </script>
    `);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('index.html')).map((d) => d.code), ['could-not-load', 'could-not-resolve-reference']);
        yield client.openFile('polymer.json', JSON.stringify({ lint: { ignoreWarnings: ['could-not-load'] } }));
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('index.html')).map((d) => d.code), ['could-not-resolve-reference']);
        yield client.cleanup();
    }));
    test('can be configured to filter out some files', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const { client } = yield util_1.createTestEnvironment();
            // Now we can be confident we won't be getting unexpected additional
            // diagnostics from recreating the linter.
            yield client.openFile('index.html', `
        <link rel="import" href="nonexistant.html">
        <script>
          class Foo extends What {};
        </script>
      `);
            chai_1.assert.deepEqual((yield client.getNextDiagnostics('index.html')).map((d) => d.code), ['could-not-load', 'could-not-resolve-reference']);
            yield client.openFile('polymer.json', JSON.stringify({ lint: { filesToIgnore: ['*dex*.html'] } }));
            chai_1.assert.deepEqual((yield client.getNextDiagnostics('index.html')).map((d) => d.code), []);
            yield client.cleanup();
        });
    });
    test('sends diagnostics around polymer.json validation', () => __awaiter(this, void 0, void 0, function* () {
        const { client, baseDir } = yield util_1.createTestEnvironment();
        fs_1.writeFileSync(path.join(baseDir, 'polymer.json'), JSON.stringify({ lint: { rules: ['bad'] } }), 'utf-8');
        yield client.watchedFilesChanged([{ path: 'polymer.json', type: main_1.FileChangeType.Created }]);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('polymer.json')).map((d) => d.message), [`Could not find lint rule with code 'bad'`]);
        yield client.openFile('polymer.json', JSON.stringify({ lint: { rules: ['polymer-2'] } }));
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('polymer.json')).map((d) => d.message), []);
        yield client.changeFile('polymer.json', JSON.stringify({ lint: { rules: {} } }));
        // This assertion is a bit roundabout because I have a PR out to improve
        // the warning generated by polymer project config.
        const messages = (yield client.getNextDiagnostics('polymer.json')).map((d) => d.message);
        chai_1.assert.match(messages[0], /Invalid polymer\.json file.*not of.*type.*array/);
        yield client.cleanup();
    }));
    // TODO(rictic): add tests for analyzeWholePackage here
    // TODO(rictic): add tests for code actions here
    // TODO(rictic): add tests for fix on save here
    // TODO(rictic): add tests for apply all fixes somewhere
});
//# sourceMappingURL=diagnostics_test.js.map