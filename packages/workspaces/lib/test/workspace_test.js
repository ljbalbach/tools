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
// NOTE(fks) 09-22-2017: The Workspace object is meant to wrap a lot of complex
// functionality together related to setup, including repo fetching, cloning,
// and resetting.
//
// While the smaller pieces this object relies on are tested individually,
// there is no way to unit test the Workspace object without making
// private implementation-detail methods public, which is exactly what we're
// trying to avoid.
//
// TODO(fks) 09-22-2017: Write some good integration tests instead.
const chai_1 = require("chai");
const path = require("path");
const workspace_1 = require("../workspace");
const mockApi = require("./_util/mock-api");
const mock_api_1 = require("./_util/mock-api");
const testWorkspaceDir = path.join(__dirname, 'TEST_WORKSPACE_DIR');
suite('src/workspace', function () {
    suite('Workspace', () => {
        suiteSetup(() => {
            mockApi.setup();
        });
        suiteTeardown(() => {
            mockApi.teardown();
        });
        suite('workspace.init()', () => {
            test('can be initialized with an empty set of patterns', () => __awaiter(this, void 0, void 0, function* () {
                const workspace = new workspace_1.Workspace({ token: mock_api_1.testApiToken, dir: testWorkspaceDir, match: [] });
                const { workspaceRepos, failures } = yield workspace.init();
                chai_1.assert.deepEqual(workspaceRepos, []);
                chai_1.assert.deepEqual([...failures], []);
            }));
        });
        suite('workspace._determineGitHubRepos()', () => {
            test('succesfully determines repos for a set of patterns to match', () => __awaiter(this, void 0, void 0, function* () {
                const workspace = new workspace_1.Workspace({
                    token: mock_api_1.testApiToken,
                    dir: testWorkspaceDir,
                    match: ['PolymerElements/paper-*']
                });
                const repos = yield workspace._determineGitHubRepos();
                chai_1.assert.deepEqual(repos.map((r) => r.fullName), [
                    'PolymerElements/paper-appbar',
                    'PolymerElements/paper-button'
                ]);
            }));
            test('succesfully determines repos for sets of patterns to match and exclude', () => __awaiter(this, void 0, void 0, function* () {
                const workspace = new workspace_1.Workspace({
                    token: mock_api_1.testApiToken,
                    dir: testWorkspaceDir,
                    match: ['PolymerElements/paper-*'],
                    exclude: ['PolymerElements/paper-button']
                });
                const repos = yield workspace._determineGitHubRepos();
                chai_1.assert.deepEqual(repos.map((r) => r.fullName), ['PolymerElements/paper-appbar']);
            }));
        });
    });
});
//# sourceMappingURL=workspace_test.js.map