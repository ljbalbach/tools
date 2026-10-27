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
const fs = require("fs");
const util = require("util");
const path = require("path");
const _rimraf = require("rimraf");
const git_1 = require("../git");
const exec_1 = require("../util/exec");
const rimraf = util.promisify(_rimraf);
suite('src/git', function () {
    this.timeout(20 * 1000);
    suite('GitRepo', () => {
        const gitDir = path.join(__dirname, 'POLYMER_WORKSPACES_GIT_DIR');
        const emptyDir = path.join(__dirname, 'POLYMER_WORKSPACES_EMPTY_DIR');
        const doesNotExistDir = path.join(__dirname, 'POLYMER_WORKSPACES_DOES_NOT_EXIST_DIR');
        setup(() => __awaiter(this, void 0, void 0, function* () {
            fs.mkdirSync(gitDir);
            fs.mkdirSync(emptyDir);
            const gitInitResult = yield exec_1.default(gitDir, `git`, [`init`]);
            chai_1.assert.equal(gitInitResult.stderr, '');
            const gitCommitResult = yield exec_1.default(gitDir, `git`, [`commit`, `--allow-empty`, `-m`, `"testing"`]);
            chai_1.assert.equal(gitCommitResult.stderr, '');
        }));
        teardown(() => __awaiter(this, void 0, void 0, function* () {
            yield rimraf(gitDir);
            yield rimraf(emptyDir);
        }));
        suite('gitRepo.isGit()', () => {
            test('returns false if current directory does not exist', () => __awaiter(this, void 0, void 0, function* () {
                const doesNotExistGitRepo = new git_1.GitRepo(doesNotExistDir);
                chai_1.assert.isFalse(doesNotExistGitRepo.isGit());
            }));
            test('returns false if current directory is not a git repo', () => __awaiter(this, void 0, void 0, function* () {
                const emptyGitRepo = new git_1.GitRepo(emptyDir);
                chai_1.assert.isFalse(emptyGitRepo.isGit());
            }));
            test('returns true if current directory is a git repo', () => __awaiter(this, void 0, void 0, function* () {
                const gitRepo = new git_1.GitRepo(gitDir);
                chai_1.assert.isTrue(gitRepo.isGit());
            }));
        });
        suite('gitRepo.getHeadSha()', () => {
            test('returns the head SHA for a given git repo', () => __awaiter(this, void 0, void 0, function* () {
                const gitRepo = new git_1.GitRepo(gitDir);
                const gitHeadSha = yield gitRepo.getHeadSha();
                chai_1.assert.isString(gitHeadSha);
                chai_1.assert.isOk(gitHeadSha.length > 6);
            }));
        });
        suite('gitRepo.createBranch()', () => __awaiter(this, void 0, void 0, function* () {
            test('creates a new branch in the git repo', () => __awaiter(this, void 0, void 0, function* () {
                const gitRepo = new git_1.GitRepo(gitDir);
                yield gitRepo.createBranch('abcdefgh');
                const getBranchNameResult = yield exec_1.default(gitDir, 'git', ['status']);
                chai_1.assert.include(getBranchNameResult.stdout, 'On branch abcdefgh');
            }));
        }));
        suite('gitRepo.checkout()', () => __awaiter(this, void 0, void 0, function* () {
            test('creates a new branch in the git repo', () => __awaiter(this, void 0, void 0, function* () {
                const gitRepo = new git_1.GitRepo(gitDir);
                yield exec_1.default(gitDir, 'git', ['checkout', '-b', 'branch-1']);
                yield exec_1.default(gitDir, 'git', ['checkout', '-b', 'branch-2']);
                const getBranch2NameResult = yield exec_1.default(gitDir, 'git', ['status']);
                chai_1.assert.include(getBranch2NameResult.stdout, 'On branch branch-2');
                yield gitRepo.checkout('branch-1');
                const getBranch1NameResult = yield exec_1.default(gitDir, 'git', ['status']);
                chai_1.assert.include(getBranch1NameResult.stdout, 'On branch branch-1');
            }));
        }));
    });
});
//# sourceMappingURL=git_test.js.map