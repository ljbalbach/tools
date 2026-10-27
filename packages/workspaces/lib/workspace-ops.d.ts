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
import { BatchProcessFn, BatchProcessResponse } from './util/batch-process';
import { ExecResult } from './util/exec';
import { WorkspaceRepo } from './workspace';
/**
 * Run some function of work over each workspace repo, returning a collection
 * of successes and failures for each run.
 */
export declare const run: BatchProcessFn<WorkspaceRepo>;
/**
 * Create a new branch on each repo.
 */
export declare function startNewBranch(workspaceRepos: WorkspaceRepo[], newBranch: string): Promise<BatchProcessResponse<WorkspaceRepo, ExecResult>>;
/**
 * Commit changes on each repo with the given commit message.
 */
export declare function commitChanges(workspaceRepos: WorkspaceRepo[], message: string): Promise<BatchProcessResponse<WorkspaceRepo, ExecResult>>;
/**
 * Push the current repo HEAD to the given branch on GitHub. If no branch is
 * given, push to the current branch on each repo.
 */
export declare function pushChangesToGithub(workspaceRepos: WorkspaceRepo[], pushToBranch?: string, forcePush?: boolean): Promise<BatchProcessResponse<WorkspaceRepo, ExecResult>>;
/**
 * Publish a new version of each repo to NPM. A new package.json version
 * will need to be set in each package before running.
 */
export declare function publishPackagesToNpm(workspaceRepos: WorkspaceRepo[], distTag?: string): Promise<BatchProcessResponse<WorkspaceRepo, ExecResult>>;
