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
// Tests for some subtler interactions with file synchronization.
// There's otherwise pretty good coverage of this stuff in the other tests.
suite('AnalyzerSynchronizer', function () {
    test('When files are created and deleted we notice', () => __awaiter(this, void 0, void 0, function* () {
        const { client, baseDir } = yield util_1.createTestEnvironment();
        yield client.openFile('foo.html', `<link rel="import" href="./bar.html">`);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('foo.html')).map((d) => d.code), ['could-not-load']);
        fs_1.writeFileSync(path.join(baseDir, 'bar.html'), '', 'utf-8');
        yield client.watchedFilesChanged([{ path: 'bar.html', type: main_1.FileChangeType.Created }]);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('foo.html')).map((d) => d.code), []);
        fs_1.unlinkSync(path.join(baseDir, 'bar.html'));
        yield client.watchedFilesChanged([{ path: 'bar.html', type: main_1.FileChangeType.Deleted }]);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('foo.html')).map((d) => d.code), ['could-not-load']);
        yield client.cleanup();
    }));
    test('When directories are created and deleted we notice', () => __awaiter(this, void 0, void 0, function* () {
        const { client, baseDir } = yield util_1.createTestEnvironment();
        yield client.openFile('foo.html', `<link rel="import" href="./dir/bar.html">`);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('foo.html')).map((d) => d.code), ['could-not-load']);
        fs_1.mkdirSync(path.join(baseDir, 'dir'));
        fs_1.writeFileSync(path.join(baseDir, 'dir', 'bar.html'), '', 'utf-8');
        yield client.watchedFilesChanged([{ path: 'dir/bar.html', type: main_1.FileChangeType.Created }]);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('foo.html')).map((d) => d.code), []);
        fs_1.unlinkSync(path.join(baseDir, 'dir', 'bar.html'));
        fs_1.rmdirSync(path.join(baseDir, 'dir'));
        // Note that we only mention the directory, not the file.
        yield client.watchedFilesChanged([{ path: 'dir', type: main_1.FileChangeType.Deleted }]);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('foo.html')).map((d) => d.code), ['could-not-load']);
        yield client.cleanup();
    }));
});
//# sourceMappingURL=analyzer-synchronizer_test.js.map