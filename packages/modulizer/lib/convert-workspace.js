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
const fse = require("fs-extra");
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const polymer_workspaces_1 = require("polymer-workspaces");
const conversion_settings_1 = require("./conversion-settings");
const gitignore_1 = require("./gitignore");
const package_manifest_1 = require("./package-manifest");
const project_converter_1 = require("./project-converter");
const special_casing_1 = require("./special-casing");
const travis_config_1 = require("./travis-config");
const workspace_url_handler_1 = require("./urls/workspace-url-handler");
const util_1 = require("./util");
exports.GIT_STAGING_BRANCH_NAME = 'polymer-modulizer-staging';
/**
 * For a given repo, generate a new package.json and write it to disk.
 */
function writePackageJson(repo, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const bowerPackageName = path.basename(repo.dir);
        const bowerJsonPath = path.join(repo.dir, 'bower.json');
        const bowerJson = fse.readJSONSync(bowerJsonPath);
        const npmPackageName = workspace_url_handler_1.lookupNpmPackageName(bowerJsonPath) || bowerPackageName;
        const packageJsonPath = path.join(repo.dir, 'package.json');
        const existingPackageJson = yield util_1.readJsonIfExists(packageJsonPath);
        const packageJson = package_manifest_1.generatePackageJson(bowerJson, Object.assign({ name: npmPackageName }, options), undefined, existingPackageJson);
        package_manifest_1.writeJson(packageJson, packageJsonPath);
    });
}
/**
 * For a given repo, generate a new package.json and write it to disk.
 */
function writeConversionManifest(repo, converter) {
    return __awaiter(this, void 0, void 0, function* () {
        const bowerPackageName = path.basename(repo.dir);
        const manifestJsonPath = path.join(repo.dir, 'manifest.json');
        const packageManifest = yield converter.getConversionManifest(bowerPackageName);
        package_manifest_1.writeJson(packageManifest, manifestJsonPath);
    });
}
/**
 * Configure a basic analyzer instance for the workspace.
 */
function configureAnalyzer(options) {
    const workspaceDir = options.workspaceDir;
    const urlResolver = new polymer_analyzer_1.PackageUrlResolver({ packageDir: workspaceDir });
    const urlLoader = new polymer_analyzer_1.InMemoryOverlayUrlLoader(new polymer_analyzer_1.FsUrlLoader(workspaceDir));
    for (const [url, contents] of special_casing_1.polymerFileOverrides) {
        urlLoader.urlContentsMap.set(urlResolver.resolve(`polymer/${url}`), contents);
    }
    return new polymer_analyzer_1.Analyzer({
        urlLoader,
        urlResolver,
    });
}
/**
 * Convert a set of workspace repos to npm packages and JavaScript modules.
 * Returns a map of all packages converted, keyed by npm package name.
 */
function convert(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const analyzer = configureAnalyzer(options);
        const analysis = yield analyzer.analyzePackage();
        const conversionSettings = conversion_settings_1.createDefaultConversionSettings(analysis, options);
        const urlHandler = new workspace_url_handler_1.WorkspaceUrlHandler(analyzer, options.workspaceDir);
        const converter = new project_converter_1.ProjectConverter(analysis, urlHandler, conversionSettings);
        const scannedPackageResults = new Map();
        // For each repo, convert the full package:
        for (const repo of options.reposToConvert) {
            const repoDirName = path.basename(repo.dir);
            const bowerConfigPath = path.join(repo.dir, 'bower.json');
            const npmPackageName = workspace_url_handler_1.lookupNpmPackageName(bowerConfigPath);
            if (!npmPackageName) {
                continue;
            }
            scannedPackageResults.set(npmPackageName, repo.dir);
            yield converter.convertPackage(repoDirName);
        }
        // Process & write each conversion result:
        const results = converter.getResults();
        yield util_1.writeFileResults(options.workspaceDir, results);
        // update .travis.yml files for repos
        for (const repo of options.reposToConvert) {
            yield travis_config_1.transformTravisConfig(repo.dir, repo.dir);
        }
        // add `node_modules` to gitignore
        for (const repo of options.reposToConvert) {
            const gitIgnoreFile = path.join(repo.dir, '.gitignore');
            yield gitignore_1.ignoreNodeModules(gitIgnoreFile);
        }
        // Generate a new package.json for each repo:
        const packageJsonResults = yield polymer_workspaces_1.run(options.reposToConvert, (repo) => __awaiter(this, void 0, void 0, function* () {
            return yield writePackageJson(repo, {
                version: options.packageVersion,
                flat: options.flat,
                private: options.private,
            });
        }));
        packageJsonResults.failures.forEach(util_1.logRepoError);
        const manifestResults = yield polymer_workspaces_1.run(options.reposToConvert, (repo) => __awaiter(this, void 0, void 0, function* () {
            return writeConversionManifest(repo, converter);
        }));
        manifestResults.failures.forEach(util_1.logRepoError);
        // Delete files that were explicitly requested to be deleted. Note we apply
        // the glob with each repo as the root directory (e.g. a glob of "types"
        // will delete "types" from each individual repo).
        if (options.deleteFiles !== undefined) {
            for (const repo of options.reposToConvert) {
                yield util_1.deleteGlobsSafe(options.deleteFiles, repo.dir);
            }
        }
        // Commit all changes to a staging branch for easy state resetting.
        // Useful when performing actions that modify the repo, like installing deps.
        const commitResults = yield polymer_workspaces_1.run(options.reposToConvert, (repo) => __awaiter(this, void 0, void 0, function* () {
            yield repo.git.createBranch(exports.GIT_STAGING_BRANCH_NAME);
            yield util_1.exec(repo.dir, 'git', ['add', '-A']);
            // TODO(fks): Add node_modules to .gitignore, if not found
            // https://github.com/Polymer/polymer-modulizer/issues/250
            yield util_1.exec(repo.dir, 'git', ['reset', '--', 'node_modules/']);
            yield repo.git.commit('auto-converted by polymer-modulizer');
        }));
        commitResults.failures.forEach(util_1.logRepoError);
        // Return a map of all packages converted, keyed by npm package name.
        return scannedPackageResults;
    });
}
exports.default = convert;
//# sourceMappingURL=convert-workspace.js.map