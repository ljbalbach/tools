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
const exec_1 = require("./util/exec");
const fs_1 = require("./util/fs");
const path = require("path");
class GitRepo {
    constructor(dir) {
        this.dir = dir;
    }
    /**
     * Returns true if directory exists and its own git repo.
     */
    isGit() {
        return fs_1.existsSync(path.join(this.dir, '.git'));
    }
    /**
     * Returns the git commit hash at HEAD.
     */
    getHeadSha() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield exec_1.default(this.dir, 'git', ['rev-parse', 'HEAD'])).stdout;
        });
    }
    /**
     * Run `git clone [url] [this.dir]`.
     */
    clone(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exec_1.default(process.cwd(), 'git', ['clone', url, this.dir, '--depth', '1', '--no-single-branch']);
        });
    }
    /**
     * Run `git fetch [remoteName]`. If remoteName is not given, git will fetch
     * from default.
     */
    fetch(remoteName) {
        return __awaiter(this, void 0, void 0, function* () {
            const commandArgs = remoteName ? ['fetch', remoteName, '--depth', '1'] :
                ['fetch', '--depth', '1'];
            return yield exec_1.default(this.dir, 'git', commandArgs);
        });
    }
    /**
     * Run `git checkout [branch] --`.
     */
    checkout(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            // Include the '--' so that branch is explicitly interpretted as branch name
            return yield exec_1.default(this.dir, 'git', ['checkout', branch, '--']);
        });
    }
    /**
     * Resets the repo back to a clean state. Note that this deletes any
     * uncommitted changes and untracked files in the repo directory, created
     * through tooling or otherwise.
     */
    destroyAllUncommittedChangesAndFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const resetResult = yield exec_1.default(this.dir, 'git', ['reset', '--hard']);
            const cleanResult = yield exec_1.default(this.dir, 'git', ['clean', '-fd']);
            return {
                reset: resetResult,
                clean: cleanResult,
            };
        });
    }
    /**
     * Run `git commit -am [message]`.
     */
    commit(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exec_1.default(this.dir, 'git', ['commit', '-a', '-m', message]);
        });
    }
    /**
     * Run `git checkout -b [branch]`.
     */
    createBranch(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exec_1.default(this.dir, 'git', ['checkout', '-b', branch]);
        });
    }
    /**
     * Run `git push` with options to push to a specific branch & --force.
     */
    pushCurrentBranchToOrigin(originBranch, forcePush = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exec_1.default(this.dir, 'git', [
                'push',
                'origin',
                // if originBranch is set, tell git to push to that specific branch
                // at origin. Otherwise, push to the default, current branch.
                originBranch ? `HEAD:${originBranch}` : `HEAD`,
                ...(forcePush ? ['--force'] : [])
            ]);
        });
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git.js.map