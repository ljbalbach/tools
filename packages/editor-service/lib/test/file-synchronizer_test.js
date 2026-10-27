"use strict";
/**
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
const fs = require("fs");
const path = require("path");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const util_1 = require("./util");
suite('FileSynchronizer', () => {
    test('reads from the filesystem by default', () => __awaiter(this, void 0, void 0, function* () {
        const { synchronizer, baseDir, converter } = util_1.createFileSynchronizer();
        fs.writeFileSync(path.join(baseDir, 'index.html'), 'Hello world.\n');
        chai_1.assert.deepEqual(yield synchronizer.urlLoader.load(converter.getAnalyzerUrl({ uri: 'index.html' })), 'Hello world.\n');
    }));
    let testName = 'uses the in-memory version while a file is open';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { synchronizer, baseDir, clientConnection, converter } = util_1.createFileSynchronizer();
        const indexPath = path.join(baseDir, 'index.html');
        const indexUri = vscode_uri_1.default.file(indexPath).toString();
        // We read the file from disk before it is opened.
        fs.writeFileSync(indexPath, 'Filesystem content');
        chai_1.assert.deepEqual(yield synchronizer.urlLoader.load(converter.getAnalyzerUrl({ uri: 'index.html' })), 'Filesystem content');
        // Open the document
        const openParams = {
            textDocument: {
                languageId: 'html',
                text: 'Initial text document content',
                uri: indexUri,
                version: 0
            }
        };
        clientConnection.sendNotification(vscode_languageserver_1.DidOpenTextDocumentNotification.type, openParams);
        let change = yield synchronizer.fileChanges.next;
        chai_1.assert.deepEqual(change, [{ type: vscode_languageserver_1.FileChangeType.Changed, uri: indexUri }]);
        chai_1.assert.deepEqual(yield synchronizer.urlLoader.load(converter.getAnalyzerUrl({ uri: 'index.html' })), 'Initial text document content');
        // Change the file in memory
        const changeParams = {
            textDocument: { uri: indexUri, version: 1 },
            contentChanges: [{
                    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 100 } },
                    text: 'Changed text document content'
                }]
        };
        clientConnection.sendNotification(vscode_languageserver_1.DidChangeTextDocumentNotification.type, changeParams);
        change = yield synchronizer.fileChanges.next;
        chai_1.assert.deepEqual(change, [{ type: vscode_languageserver_1.FileChangeType.Changed, uri: indexUri }]);
        chai_1.assert.deepEqual(yield synchronizer.urlLoader.load(converter.getAnalyzerUrl({ uri: 'index.html' })), 'Changed text document content');
        // Close without saving
        const closeParams = { textDocument: { uri: indexUri } };
        clientConnection.sendNotification(vscode_languageserver_1.DidCloseTextDocumentNotification.type, closeParams);
        change = yield synchronizer.fileChanges.next;
        chai_1.assert.deepEqual(change, [{ type: vscode_languageserver_1.FileChangeType.Changed, uri: indexUri }]);
        chai_1.assert.deepEqual(yield synchronizer.urlLoader.load(converter.getAnalyzerUrl({ uri: 'index.html' })), 'Filesystem content');
    }));
    testName = 'passes along notifications about files changed on disk';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { synchronizer, baseDir, clientConnection } = util_1.createFileSynchronizer();
        const changes = [
            {
                type: vscode_languageserver_1.FileChangeType.Created,
                uri: vscode_uri_1.default.file(path.join(baseDir, 'created.html')).toString()
            },
            {
                type: vscode_languageserver_1.FileChangeType.Changed,
                uri: vscode_uri_1.default.file(path.join(baseDir, 'changed.html')).toString()
            },
            {
                type: vscode_languageserver_1.FileChangeType.Deleted,
                uri: vscode_uri_1.default.file(path.join(baseDir, 'deleted.html')).toString()
            },
        ];
        const filesChangedParams = { changes };
        clientConnection.sendNotification(vscode_languageserver_1.DidChangeWatchedFilesNotification.type, filesChangedParams);
        const receivedChanges = yield synchronizer.fileChanges.next;
        chai_1.assert.deepEqual(receivedChanges, changes);
    }));
});
//# sourceMappingURL=file-synchronizer_test.js.map