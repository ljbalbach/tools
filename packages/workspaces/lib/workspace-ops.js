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
const batch_process_1 = require("./util/batch-process");
/**
 * Run some function of work over each workspace repo, returning a collection
 * of successes and failures for each run.
 */
exports.run = batch_process_1.batchProcess;
/**
 * Create a new branch on each repo.
 */
function startNewBranch(workspaceRepos, newBranch) {
    return __awaiter(this, void 0, void 0, function* () {
        return batch_process_1.batchProcess(workspaceRepos, (repo) => {
            return repo.git.createBranch(newBranch);
        }, { concurrency: batch_process_1.fsConcurrencyPreset });
    });
}
exports.startNewBranch = startNewBranch;
/**
 * Commit changes on each repo with the given commit message.
 */
function commitChanges(workspaceRepos, message) {
    return __awaiter(this, void 0, void 0, function* () {
        return batch_process_1.batchProcess(workspaceRepos, (repo) => {
            return repo.git.commit(message);
        }, { concurrency: batch_process_1.fsConcurrencyPreset });
    });
}
exports.commitChanges = commitChanges;
/**
 * Push the current repo HEAD to the given branch on GitHub. If no branch is
 * given, push to the current branch on each repo.
 */
function pushChangesToGithub(workspaceRepos, pushToBranch, forcePush = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return batch_process_1.batchProcess(workspaceRepos, (repo) => {
            return repo.git.pushCurrentBranchToOrigin(pushToBranch, forcePush);
        }, { concurrency: batch_process_1.githubConcurrencyPreset });
    });
}
exports.pushChangesToGithub = pushChangesToGithub;
/**
 * Publish a new version of each repo to NPM. A new package.json version
 * will need to be set in each package before running.
 */
function publishPackagesToNpm(workspaceRepos, distTag = 'latest') {
    return __awaiter(this, void 0, void 0, function* () {
        return batch_process_1.batchProcess(workspaceRepos, (repo) => {
            return repo.npm.publishToNpm(distTag);
        }, { concurrency: batch_process_1.npmPublishConcurrencyPreset });
    });
}
exports.publishPackagesToNpm = publishPackagesToNpm;
//# sourceMappingURL=workspace-ops.js.map