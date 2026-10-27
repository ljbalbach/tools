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
import { ExecResult } from './util/exec';
export declare class GitRepo {
    dir: string;
    constructor(dir: string);
    /**
     * Returns true if directory exists and its own git repo.
     */
    isGit(): boolean;
    /**
     * Returns the git commit hash at HEAD.
     */
    getHeadSha(): Promise<string>;
    /**
     * Run `git clone [url] [this.dir]`.
     */
    clone(url: string): Promise<ExecResult>;
    /**
     * Run `git fetch [remoteName]`. If remoteName is not given, git will fetch
     * from default.
     */
    fetch(remoteName?: string): Promise<ExecResult>;
    /**
     * Run `git checkout [branch] --`.
     */
    checkout(branch: string): Promise<ExecResult>;
    /**
     * Resets the repo back to a clean state. Note that this deletes any
     * uncommitted changes and untracked files in the repo directory, created
     * through tooling or otherwise.
     */
    destroyAllUncommittedChangesAndFiles(): Promise<{
        reset: ExecResult;
        clean: ExecResult;
    }>;
    /**
     * Run `git commit -am [message]`.
     */
    commit(message: string): Promise<ExecResult>;
    /**
     * Run `git checkout -b [branch]`.
     */
    createBranch(branch: string): Promise<ExecResult>;
    /**
     * Run `git push` with options to push to a specific branch & --force.
     */
    pushCurrentBranchToOrigin(originBranch?: string, forcePush?: boolean): Promise<ExecResult>;
}
