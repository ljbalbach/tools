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
/**
 * A reference to a GitHub repo, with an optional reference to a specific ref
 * (branch/tag/sha).
 */
export interface GitHubRepoReference {
    owner: string;
    name: string;
    fullName: string;
    ref?: string;
}
/**
 * All GitHub repo data, returned from the GitHub API. This data is independent
 * from any one reference and can be cached for multiple runs /
 * GitHubRepoReference objects.
 */
export interface GitHubRepoData {
    owner: string;
    name: string;
    fullName: string;
    cloneUrl: string;
    defaultBranch: string;
}
/**
 * A complete GitHub repo object. Includes all data from GitHub and an optional
 * reference to a specific branch/tag/sha/etc.
 */
export interface GitHubRepo extends GitHubRepoData {
    ref?: string;
}
/**
 * GitHubConnection is a wrapper class for the GitHub npm package that
 * assumes action as-a-user, and a minimal set of supported API calls (mostly
 * to do with listing and cloning owned repos) using a token and building in
 * rate-limiting functionality using the Bottleneck library to throttle API
 * consumption.
 */
export declare class GitHubConnection {
    private _cache;
    private _github;
    constructor(token: string);
    resetCache(): void;
    setCache(key: string, value: GitHubRepoData): Map<string, GitHubRepoData>;
    getCached(key: string): GitHubRepoData | undefined;
    /**
     * Given a GitHubRepoReference, load its full, hydrated GitHubRepo object.
     */
    getRepoInfo(repoReference: GitHubRepoReference): Promise<GitHubRepo>;
    /**
     * Returns an array of repos for the given owner or organization.
     * Caches all loaded repos for quick access later as well.
     */
    getOwnerRepos(owner: string): Promise<GitHubRepoData[]>;
    /**
     * Given a collection of repo patterns, replace any that represent wildcard
     * values with the literal values after comparing against names of repos on
     * GitHub.
     *
     * Examples:
     * - `Polymer/*` => expands to everything owned by Polymer org
     * - `PolymerElements/iron-*` => expands to all `iron-*` repos owned by
     *   the PolymerElements org.
     * - `PolymerElements/*#2.0-preview` => expands to everything owned by the
     *   PolymerElements org, with a specific reference to their "2.0-preview"
     *   branches.
     */
    expandRepoPatterns(repoPatterns: string[]): Promise<GitHubRepoReference[]>;
}
