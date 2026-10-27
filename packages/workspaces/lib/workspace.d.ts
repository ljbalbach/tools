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
import { GitRepo } from './git';
import { NpmPackage } from './npm';
import { GitHubRepo } from './github';
import { ExecResult } from './util/exec';
/**
 * When running a batch process, return an array of two items: the
 * WorkspaceRepos where the until of work completed successfully, and a Map of
 * all WorkspaceRepos where the work failed (pointing to the thrown Error in
 * each directory).
 */
export declare type BatchProcessResponse = [WorkspaceRepo[], Map<WorkspaceRepo, Error>];
/**
 * A WorkspaceRepo contains all data to specify the github repo, as well as
 * an active session to interact with the local git repository.
 */
export interface WorkspaceRepo {
    dir: string;
    git: GitRepo;
    npm: NpmPackage;
    github: GitHubRepo;
}
export interface WorkspaceOptions {
    token: string;
    dir: string;
    match: string[];
    exclude?: string[];
    fresh?: boolean;
    verbose?: boolean;
}
/**
 * Workspace - An instance for creating new workspaces. The `init()`
 * method drives the loading, creation, and configuration of each workspace
 * repo. Repos are loaded from GitHub, and a GitHub API Token is required to
 * use.
 *
 * A Workspace instance returns WorkspaceRepo objects, which the user
 * can use to interact with each repo in the workspace.
 */
export declare class Workspace {
    readonly dir: string;
    private readonly options;
    private readonly _github;
    constructor(options: WorkspaceOptions);
    /**
     * Initialize the workspace. This is the driver of all initialization and
     * setup logic.
     */
    init(): Promise<{
        workspaceRepos: WorkspaceRepo[];
        failures: Map<WorkspaceRepo, Error>;
    }>;
    /**
     * Install all bower dependencies in the initialized workspace.
     */
    installBowerDependencies(): Promise<ExecResult>;
    /**
     * Lookup & resolve the set of given "match"/"exclude" patterns (expanding
     * wildcard-containing patterns as needed) to return full GitHub repo
     * information for all matched repos.
     */
    _determineGitHubRepos(): Promise<GitHubRepo[]>;
    /**
     * Create a new WorkspaceRepo -- includes an active GitRepo session - for a
     * given GitHubRepo object.
     */
    private _openWorkspaceRepo;
    /**
     * Cleans up the workspace folder and fixes repos which may be in
     * incomplete or bad state due to previous abandoned runs.
     */
    private _prepareWorkspaceFolders;
    /**
     * Given all the repos defined in the workspace, lets iterate through them
     * and either clone them or update their clones and set them to the specific
     * refs.
     */
    private _cloneOrUpdateWorkspaceRepos;
    /**
     * Creates a .bowerrc that tells bower to use the workspace dir (`.`) as
     * the installation dir (instead of default (`./bower_components`) dir.
     * Creates a bower.json which sets all the workspace repos as dependencies
     * and also includes the devDependencies from all workspace repos under test.
     */
    private _configureBowerWorkspace;
}
