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
const fs = require("fs");
const path = require("path");
const util = require("util");
const git_1 = require("./git");
const npm_1 = require("./npm");
const github_1 = require("./github");
const bower_1 = require("./util/bower");
const exec_1 = require("./util/exec");
const fs_1 = require("./util/fs");
const batch_process_1 = require("./util/batch-process");
const _rimraf = require("rimraf");
const rimraf = util.promisify(_rimraf);
/**
 * Like Object.assign(), copy the values from one Map to the target Map.
 */
function mapAssign(target, source) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const [repo, error] of source) {
            target.set(repo, error);
        }
    });
}
/**
 * Either clone the given WorkspaceRepo or fetch/update an existing local git
 * repo, checking out the specific repo refs.
 */
function cloneOrUpdateWorkspaceRepo(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (repo.git.isGit()) {
            yield repo.git.fetch();
            yield repo.git.destroyAllUncommittedChangesAndFiles();
        }
        else {
            yield repo.git.clone(repo.github.cloneUrl);
        }
        yield repo.git.checkout(repo.github.ref || repo.github.defaultBranch);
    });
}
/**
 * Validate your environment/workspace/context before running. Throws an
 * exception if a problem is found.
 *
 * This is required so that we can use the globally installed commands without
 * installing and compiling our own copies.
 */
function validateEnvironment() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield exec_1.checkCommand('git'))) {
            throw new Error('polymer-workspace: global "git" command not found. Install git on your machine and then retry.');
        }
        if (!(yield exec_1.checkCommand('bower'))) {
            throw new Error('polymer-workspace: global "bower" command not found. Install bower on your machine and then retry.');
        }
        if (!(yield exec_1.checkCommand('npm'))) {
            throw new Error('polymer-workspace: global "npm" command not found. Install npm on your machine and then retry.');
        }
    });
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
class Workspace {
    constructor(options) {
        this.dir = options.dir;
        this.options = options;
        this._github = new github_1.GitHubConnection(options.token);
    }
    /**
     * Initialize the workspace. This is the driver of all initialization and
     * setup logic.
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate the current environment is polymer-workspace-ready.
            yield validateEnvironment();
            // Fetch our repos from the given patterns.
            const githubRepos = yield this._determineGitHubRepos();
            let workspaceRepos = githubRepos.map((r) => this._openWorkspaceRepo(r));
            const failedWorkspaceRepos = new Map();
            // Clean up the workspace folder and prepare it for repo clones.
            yield this._prepareWorkspaceFolders(workspaceRepos);
            // Update in-place and/or clone repositories from GitHub.
            const repoUpdateResults = yield this._cloneOrUpdateWorkspaceRepos(workspaceRepos);
            mapAssign(failedWorkspaceRepos, repoUpdateResults.failures);
            workspaceRepos = [...repoUpdateResults.successes.keys()];
            // Setup Bower for the entire workspace.
            const bowerConfigureResults = yield this._configureBowerWorkspace(workspaceRepos);
            mapAssign(failedWorkspaceRepos, bowerConfigureResults.failures);
            workspaceRepos = [...bowerConfigureResults.successes.keys()];
            // All done!
            return { workspaceRepos, failures: failedWorkspaceRepos };
        });
    }
    /**
     * Install all bower dependencies in the initialized workspace.
     */
    installBowerDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            return exec_1.default(this.dir, `bower`, ['install', '-F'], { maxBuffer: 1000 * 1024 });
        });
    }
    /**
     * Lookup & resolve the set of given "match"/"exclude" patterns (expanding
     * wildcard-containing patterns as needed) to return full GitHub repo
     * information for all matched repos.
     */
    _determineGitHubRepos() {
        return __awaiter(this, void 0, void 0, function* () {
            const matchPatterns = this.options.match;
            const excludePatterns = (this.options.exclude ||
                []).map(((excludePattern) => excludePattern.toLowerCase()));
            const allMatchedReferences = yield this._github.expandRepoPatterns(matchPatterns);
            const matchedReferences = allMatchedReferences.filter((ref) => {
                return !excludePatterns.includes(ref.fullName.toLowerCase());
            });
            // Fetch the full repo information for each matched reference
            const matchedRepos = yield batch_process_1.batchProcess(matchedReferences, (ref) => __awaiter(this, void 0, void 0, function* () { return this._github.getRepoInfo(ref); }), { concurrency: batch_process_1.githubConcurrencyPreset });
            matchedRepos.failures.forEach((err, ref) => {
                console.log(`Repo not found: ${ref.fullName} (${err.message})`);
            });
            return [...matchedRepos.successes.values()];
        });
    }
    /**
     * Create a new WorkspaceRepo -- includes an active GitRepo session - for a
     * given GitHubRepo object.
     */
    _openWorkspaceRepo(repo) {
        const sessionDir = path.resolve(this.dir, repo.name);
        return {
            dir: sessionDir,
            git: new git_1.GitRepo(sessionDir),
            npm: new npm_1.NpmPackage(sessionDir),
            github: repo,
        };
    }
    /**
     * Cleans up the workspace folder and fixes repos which may be in
     * incomplete or bad state due to previous abandoned runs.
     */
    _prepareWorkspaceFolders(repos) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceDir = this.dir;
            // Clean up repos when 'fresh' option is true.
            if (this.options.fresh) {
                if (this.options.verbose) {
                    console.log(`Removing workspace folder ${workspaceDir}...`);
                }
                yield rimraf(workspaceDir);
            }
            // Ensure repos folder exists.
            if (!fs_1.existsSync(workspaceDir)) {
                if (this.options.verbose) {
                    console.log(`Creating workspace folder ${workspaceDir}...`);
                }
                fs.mkdirSync(workspaceDir);
            }
            // If a folder exists for a workspace repo and it can't be opened,
            // we need to remove it.  This happens when there's not a --fresh
            // invocation and bower installed the dependency instead of git.
            return batch_process_1.batchProcess(repos, (repo) => __awaiter(this, void 0, void 0, function* () {
                if (fs_1.existsSync(repo.dir) && !repo.git.isGit()) {
                    if (this.options.verbose) {
                        console.log(`Removing existing folder: ${repo.dir}...`);
                    }
                    yield rimraf(repo.dir);
                }
            }), { concurrency: batch_process_1.fsConcurrencyPreset });
        });
    }
    /**
     * Given all the repos defined in the workspace, lets iterate through them
     * and either clone them or update their clones and set them to the specific
     * refs.
     */
    _cloneOrUpdateWorkspaceRepos(repos) {
        return __awaiter(this, void 0, void 0, function* () {
            return batch_process_1.batchProcess(repos, cloneOrUpdateWorkspaceRepo, { concurrency: batch_process_1.fsConcurrencyPreset });
        });
    }
    /**
     * Creates a .bowerrc that tells bower to use the workspace dir (`.`) as
     * the installation dir (instead of default (`./bower_components`) dir.
     * Creates a bower.json which sets all the workspace repos as dependencies
     * and also includes the devDependencies from all workspace repos under test.
     */
    _configureBowerWorkspace(repos) {
        return __awaiter(this, void 0, void 0, function* () {
            fs.writeFileSync(path.join(this.dir, '.bowerrc'), '{"directory": "."}');
            const bowerConfig = bower_1.mergedBowerConfigsFromRepos(repos);
            // Make bower config point bower packages of workspace repos to themselves
            // to override whatever any direct or transitive dependencies say.
            const results = yield batch_process_1.batchProcess(repos, (repo) => __awaiter(this, void 0, void 0, function* () {
                const sha = yield repo.git.getHeadSha();
                bowerConfig.dependencies[repo.github.name] =
                    `./${repo.github.name}#${sha}`;
            }), { concurrency: batch_process_1.fsConcurrencyPreset });
            fs.writeFileSync(path.join(this.dir, 'bower.json'), JSON.stringify(bowerConfig));
            return results;
        });
    }
}
exports.Workspace = Workspace;
//# sourceMappingURL=workspace.js.map