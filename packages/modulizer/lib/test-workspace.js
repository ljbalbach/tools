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
const chalk_1 = require("chalk");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const path = require("path");
const polymer_workspaces_1 = require("polymer-workspaces");
const convert_workspace_1 = require("./convert-workspace");
const package_manifest_1 = require("./package-manifest");
const workspace_url_handler_1 = require("./urls/workspace-url-handler");
const util_1 = require("./util");
/**
 * Setup the workspace repos for testing. Be sure to call restoreRepos() after
 * testing is complete.
 */
function setupRepos(reposUnderTest, localConversionMap, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return polymer_workspaces_1.run(reposUnderTest, (repo) => __awaiter(this, void 0, void 0, function* () {
            yield util_1.exec(repo.dir, 'git', ['checkout', '-B', package_manifest_1.localDependenciesBranch]);
            yield writeTestingPackageJson(repo, localConversionMap, options);
            yield util_1.exec(repo.dir, 'git', ['commit', '-am', 'testing commit', '--allow-empty']);
        }), { concurrency: 10 });
    });
}
/**
 * Run `yarn install` to install dependencies in a repo. Note that this creates
 * a node_modules/ folder & an associated yarn.lock file as side effects.
 */
function installNpmDependencies(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO(fks): Get `yarn install --flat` working to test flat install
        // See: https://github.com/Polymer/polymer-modulizer/issues/254
        return util_1.exec(repo.dir, 'npm', ['install']);
    });
}
/**
 * Run `wct --npm` in a repo.
 */
function testRepo(repo, wctFlags) {
    return __awaiter(this, void 0, void 0, function* () {
        const repoDirName = path.basename(repo.dir);
        const results = yield util_1.exec(repo.dir, 'wct', wctFlags);
        if (results.stdout.length > 0) {
            console.log(chalk_1.default.dim(`${repoDirName}: ${results.stdout}`));
        }
        if (results.stderr.length > 0) {
            console.log(chalk_1.default.red(`${repoDirName}: ${results.stderr}`));
        }
        return results;
    });
}
/**
 * Restore the repos to their proper state.
 */
function restoreRepos(reposUnderTest) {
    return __awaiter(this, void 0, void 0, function* () {
        return polymer_workspaces_1.run(reposUnderTest, (repo) => __awaiter(this, void 0, void 0, function* () {
            yield repo.git.destroyAllUncommittedChangesAndFiles();
            yield repo.git.checkout(convert_workspace_1.GIT_STAGING_BRANCH_NAME);
        }), { concurrency: 10 });
    });
}
/**
 * For a given repo, generate a new package.json and write it to disk. This
 * is a testing-specific package.json manifest, which means that it will
 * include local references to dependencies that were also converted in the
 * workspace.
 */
function writeTestingPackageJson(repo, localConversionMap, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const bowerPackageName = path.basename(repo.dir);
        const bowerJsonPath = path.join(repo.dir, 'bower.json');
        const bowerJson = yield fse.readJSON(bowerJsonPath);
        const npmPackageName = workspace_url_handler_1.lookupNpmPackageName(bowerJsonPath) || bowerPackageName;
        const packageJsonPath = path.join(repo.dir, 'package.json');
        const existingPackageJson = yield util_1.readJsonIfExists(packageJsonPath);
        const packageJson = package_manifest_1.generatePackageJson(bowerJson, {
            name: npmPackageName,
            version: options.packageVersion,
            flat: options.flat,
            private: options.private,
        }, localConversionMap, existingPackageJson);
        package_manifest_1.writeJson(packageJson, packageJsonPath);
    });
}
function testWorkspace(localConversionMap, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { wctFlagsRaw } = yield inquirer.prompt([
            {
                type: 'input',
                name: 'wctFlagsRaw',
                message: 'wct flags:',
                default: (options.importStyle === 'path') ?
                    '--npm' :
                    '--npm --module-resolution=node',
            },
        ]);
        const allRepos = options.reposToConvert;
        const wctFlags = wctFlagsRaw.split(/\s+/);
        util_1.logStep(1, 4, '🔧', `Preparing Repos...`);
        const setupRepoResults = yield setupRepos(allRepos, localConversionMap, options);
        setupRepoResults.failures.forEach(util_1.logRepoError);
        util_1.logStep(2, 4, '🔧', `Running Tests...`);
        const runResults = yield polymer_workspaces_1.run([...setupRepoResults.successes.keys()], (repo) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield installNpmDependencies(repo);
                return yield testRepo(repo, wctFlags);
            }
            catch (err) {
                util_1.logRepoError(err, repo);
                throw err;
            }
        }), { concurrency: 1 });
        util_1.logStep(3, 4, '🔧', `Restoring Repos...`);
        const restoreResults = yield restoreRepos(allRepos);
        restoreResults.failures.forEach(util_1.logRepoError);
        util_1.logStep(4, 4, '🔧', `Tests Complete!`);
        return [...runResults.successes.keys()];
    });
}
exports.testWorkspace = testWorkspace;
function testWorkspaceInstallOnly(localConversionMap, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const allRepos = options.reposToConvert;
        util_1.logStep(1, 4, '🔧', `Preparing Repos...`);
        const setupRepoResults = yield setupRepos(allRepos, localConversionMap, options);
        setupRepoResults.failures.forEach(util_1.logRepoError);
        util_1.logStep(2, 4, '🔧', `Installing Dependencies...`);
        const runResults = yield polymer_workspaces_1.run([...setupRepoResults.successes.keys()], (repo) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield installNpmDependencies(repo);
            }
            catch (err) {
                util_1.logRepoError(err, repo);
                throw err;
            }
        }), { concurrency: 1 });
        util_1.logStep(3, 4, '🔧', `Restoring Repos...`);
        const restoreResults = yield restoreRepos(allRepos);
        restoreResults.failures.forEach(util_1.logRepoError);
        util_1.logStep(4, 4, '🔧', `Tests Complete!`);
        return [...runResults.successes.keys()];
    });
}
exports.testWorkspaceInstallOnly = testWorkspaceInstallOnly;
//# sourceMappingURL=test-workspace.js.map