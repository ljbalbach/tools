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
const path = require("path");
const polymer_project_config_1 = require("polymer-project-config");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const settings_1 = require("../language-server/settings");
const util_1 = require("./util");
suite('Settings', () => {
    function createSettings(debugging) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serverConnection, clientConnection, synchronizer, baseDir } = util_1.createFileSynchronizer(undefined, debugging);
            const { analyzer } = yield polymer_project_config_1.ProjectConfig.initializeAnalyzerFromDirectory(baseDir);
            const settings = new settings_1.default(serverConnection, synchronizer, analyzer);
            return { settings, serverConnection, clientConnection, baseDir };
        });
    }
    test('starts with default values', () => __awaiter(this, void 0, void 0, function* () {
        const { settings } = yield createSettings();
        chai_1.assert.deepEqual(settings.analyzeWholePackage, false);
        chai_1.assert.deepEqual(settings.fixOnSave, false);
    }));
    test('updates when an update comes in', () => __awaiter(this, void 0, void 0, function* () {
        const { settings, clientConnection } = yield createSettings();
        chai_1.assert.deepEqual({
            analyzeWholePackage: settings.analyzeWholePackage,
            fixOnSave: settings.fixOnSave
        }, { analyzeWholePackage: false, fixOnSave: false });
        clientConnection.sendNotification(vscode_languageserver_1.DidChangeConfigurationNotification.type, {
            settings: { 'polymer-ide': { fixOnSave: true, analyzeWholePackage: true } }
        });
        const settingsChange = yield settings.changeStream.next;
        chai_1.assert.deepEqual(settingsChange, {
            newer: {
                fixOnSave: true,
                analyzeWholePackage: true,
                referencesCodeLens: false,
                logToClient: false,
                logToFile: undefined
            },
            older: {
                fixOnSave: false,
                analyzeWholePackage: false,
                referencesCodeLens: false,
                logToClient: false,
                logToFile: undefined
            }
        });
        chai_1.assert.deepEqual({
            analyzeWholePackage: settings.analyzeWholePackage,
            fixOnSave: settings.fixOnSave,
            referencesCodeLens: false,
            logToClient: false,
            logToFile: undefined
        }, {
            analyzeWholePackage: true,
            fixOnSave: true,
            referencesCodeLens: false,
            logToClient: false,
            logToFile: undefined
        });
    }));
    test('missing settings are filled in with defaults.', () => __awaiter(this, void 0, void 0, function* () {
        const { settings, clientConnection } = yield createSettings();
        clientConnection.sendNotification(vscode_languageserver_1.DidChangeConfigurationNotification.type, {
            settings: { 'polymer-ide': { fixOnSave: true, analyzeWholePackage: true } }
        });
        yield settings.changeStream.next;
        chai_1.assert.deepEqual({
            analyzeWholePackage: settings.analyzeWholePackage,
            fixOnSave: settings.fixOnSave
        }, { analyzeWholePackage: true, fixOnSave: true });
        clientConnection.sendNotification(vscode_languageserver_1.DidChangeConfigurationNotification.type, {
            settings: {
                'polymer-ide': { fixOnSave: true, }
            }
        });
        yield settings.changeStream.next;
        chai_1.assert.deepEqual({
            analyzeWholePackage: settings.analyzeWholePackage,
            fixOnSave: settings.fixOnSave
        }, { analyzeWholePackage: false, fixOnSave: true });
    }));
    test('keeps ProjectConfig synchronized', () => __awaiter(this, void 0, void 0, function* () {
        const { settings, clientConnection, baseDir } = yield createSettings();
        chai_1.assert.equal(settings.projectConfig.lint, undefined);
        chai_1.assert.equal(settings.projectConfigDiagnostic, null);
        yield settings.projectConfigChangeStream.next;
        let openedParams = {
            textDocument: {
                languageId: 'json',
                text: JSON.stringify({ lint: { rules: ['polymer-2'] } }),
                version: 1,
                uri: vscode_uri_1.default.file(path.join(baseDir, 'polymer.json')).toString()
            }
        };
        clientConnection.sendNotification(vscode_languageserver_1.DidOpenTextDocumentNotification.type, openedParams);
        yield settings.projectConfigChangeStream.next;
        chai_1.assert.equal(settings.projectConfigDiagnostic, null);
        chai_1.assert.deepEqual(settings.projectConfig.lint, { rules: ['polymer-2'] });
        openedParams = {
            textDocument: {
                languageId: 'json',
                text: JSON.stringify({ lint: { rules: { foo: 'polymer-2' } } }),
                version: 1,
                uri: vscode_uri_1.default.file(path.join(baseDir, 'polymer.json')).toString()
            }
        };
        clientConnection.sendNotification(vscode_languageserver_1.DidOpenTextDocumentNotification.type, openedParams);
        yield settings.projectConfigChangeStream.next;
        chai_1.assert.deepEqual(settings.projectConfig.lint, undefined);
        chai_1.assert.equal(settings.projectConfigDiagnostic.message, `Invalid polymer.json file: ` +
            `Property 'lint.rules' is not of a type(s) array`);
    }));
});
//# sourceMappingURL=settings_test.js.map