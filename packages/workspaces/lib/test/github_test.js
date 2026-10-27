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
const github_1 = require("../github");
const mockApi = require("./_util/mock-api");
const mock_api_1 = require("./_util/mock-api");
suite('src/github', () => {
    suiteSetup(() => {
        mockApi.setup();
    });
    suiteTeardown(() => {
        mockApi.teardown();
    });
    suite('GitHubConnection', () => {
        suite('githubConnection.expandRepoPatterns()', () => {
            let githubConnection;
            setup(() => {
                githubConnection = new github_1.GitHubConnection(mock_api_1.testApiToken);
            });
            test('handles static owner/name pattern', () => __awaiter(this, void 0, void 0, function* () {
                const references = yield githubConnection.expandRepoPatterns(['polymer/polymer']);
                chai_1.assert.deepEqual(references, [{
                        fullName: 'polymer/polymer',
                        owner: 'polymer',
                        name: 'polymer',
                        ref: undefined,
                    }]);
            }));
            test('handles static owner/name#ref pattern', () => __awaiter(this, void 0, void 0, function* () {
                const references = yield githubConnection.expandRepoPatterns(['polymer/polymer#some-branch']);
                chai_1.assert.deepEqual(references, [{
                        fullName: 'polymer/polymer',
                        owner: 'polymer',
                        name: 'polymer',
                        ref: 'some-branch',
                    }]);
            }));
            test('handles dynamic owner/* pattern', () => __awaiter(this, void 0, void 0, function* () {
                const references = yield githubConnection.expandRepoPatterns(['polymerelements/*']);
                chai_1.assert.deepEqual(references, [
                    {
                        owner: 'PolymerElements',
                        name: 'paper-appbar',
                        fullName: 'PolymerElements/paper-appbar',
                        ref: undefined
                    },
                    {
                        owner: 'PolymerElements',
                        name: 'paper-button',
                        fullName: 'PolymerElements/paper-button',
                        ref: undefined
                    },
                    {
                        owner: 'PolymerElements',
                        name: 'iron-ajax',
                        fullName: 'PolymerElements/iron-ajax',
                        ref: undefined
                    }
                ]);
            }));
            test('handles dynamic owner/*#ref pattern', () => __awaiter(this, void 0, void 0, function* () {
                const references = yield githubConnection.expandRepoPatterns(['polymerelements/*#ABCDEFGH']);
                chai_1.assert.deepEqual(references, [{
                        owner: 'PolymerElements',
                        name: 'paper-appbar',
                        fullName: 'PolymerElements/paper-appbar',
                        ref: 'ABCDEFGH'
                    }]);
            }));
            test('handles dynamic owner/partial-name-* pattern', () => __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.deepEqual(yield githubConnection.expandRepoPatterns(['polymerelements/paper-*']), [
                    {
                        owner: 'PolymerElements',
                        name: 'paper-appbar',
                        fullName: 'PolymerElements/paper-appbar',
                        ref: undefined
                    },
                    {
                        owner: 'PolymerElements',
                        name: 'paper-button',
                        fullName: 'PolymerElements/paper-button',
                        ref: undefined
                    },
                ]);
                chai_1.assert.deepEqual(yield githubConnection.expandRepoPatterns(['polymerelements/iron-*']), [
                    {
                        owner: 'PolymerElements',
                        name: 'iron-ajax',
                        fullName: 'PolymerElements/iron-ajax',
                        ref: undefined
                    },
                ]);
            }));
            test('handles dynamic owner/partial-name-*#ref pattern', () => __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.deepEqual(yield githubConnection.expandRepoPatterns(['polymerelements/paper-*#ABCDEFGH']), [
                    {
                        owner: 'PolymerElements',
                        name: 'paper-appbar',
                        fullName: 'PolymerElements/paper-appbar',
                        ref: 'ABCDEFGH'
                    },
                ]);
                chai_1.assert.deepEqual(yield githubConnection.expandRepoPatterns(['polymerelements/iron-*#ABCDEFGH']), []);
            }));
        });
        suite('githubConnection.getRepoInfo()', () => {
            test('returns full GitHubRepo object from a reference', () => __awaiter(this, void 0, void 0, function* () {
                const githubConnection = new github_1.GitHubConnection(mock_api_1.testApiToken);
                const repo = yield githubConnection.getRepoInfo({ owner: 'polymer', name: 'polymer', fullName: 'polymer/polymer' });
                chai_1.assert.deepEqual(repo, {
                    owner: 'Polymer',
                    name: 'polymer',
                    fullName: 'Polymer/polymer',
                    cloneUrl: 'https://github.com/Polymer/polymer.git',
                    defaultBranch: 'master',
                    ref: undefined,
                });
            }));
            test('returns full GitHubRepo object from a reference to a specific branch', () => __awaiter(this, void 0, void 0, function* () {
                const githubConnection = new github_1.GitHubConnection(mock_api_1.testApiToken);
                const repo = yield githubConnection.getRepoInfo({
                    owner: 'polymer',
                    name: 'polymer',
                    fullName: 'polymer/polymer',
                    ref: 'some-branch'
                });
                chai_1.assert.deepEqual(repo, {
                    owner: 'Polymer',
                    name: 'polymer',
                    fullName: 'Polymer/polymer',
                    cloneUrl: 'https://github.com/Polymer/polymer.git',
                    defaultBranch: 'master',
                    ref: 'some-branch',
                });
            }));
            test('caches loaded repos for later', () => __awaiter(this, void 0, void 0, function* () {
                const githubConnection = new github_1.GitHubConnection(mock_api_1.testApiToken);
                const repoNotCached = githubConnection.getCached('polymer/polymer');
                chai_1.assert.isUndefined(repoNotCached);
                yield githubConnection.getRepoInfo({ owner: 'polymer', name: 'polymer', fullName: 'polymer/polymer' });
                const repoCached = githubConnection.getCached('polymer/polymer');
                chai_1.assert.isDefined(repoCached);
            }));
        });
    });
});
//# sourceMappingURL=github_test.js.map