"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const fse = require("fs-extra");
const inquirer = require("inquirer");
const path = require("path");
const semver = require("semver");
const convert_package_1 = require("../convert-package");
const package_manifest_1 = require("../package-manifest");
const util_1 = require("../util");
const util_2 = require("./util");
function run(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const inDir = path.resolve(options.in || process.cwd());
        const outDir = path.resolve(options.out);
        // Ok, we're updating a package in a directory not under our control.
        // We need to be sure it's safe.
        let stdout, stderr;
        let isRepo = true;
        try {
            ({ stdout, stderr } = yield util_1.exec(inDir, 'git', ['status', '-s']));
        }
        catch (e) {
            // Grab command execution results from exception info.
            ({ stdout, stderr } = e);
            isRepo =
                stderr === undefined || stderr.indexOf('Not a git repository') === -1;
        }
        if (!isRepo) {
            console.warn(`Not a git repo, proceeding.`);
        }
        if (!options.force && isRepo && (stdout || stderr)) {
            console.error(`Git repo is dirty. Check all changes in to source control and ` +
                `then try again.`);
            process.exit(1);
        }
        for (const rawMapping of options['dependency-mapping']) {
            try {
                const [bowerName, npmName, npmSemver] = util_2.parseDependencyMappingInput(rawMapping);
                package_manifest_1.saveDependencyMapping(bowerName, npmName, npmSemver);
            }
            catch (err) {
                console.error(err.message);
                process.exit(1);
            }
        }
        // TODO: each file is not always needed, refactor to optimize loading
        let inBowerJson;
        let inPackageJson;
        let outPackageJson;
        try {
            outPackageJson = yield fse.readJSON(path.join(outDir, 'package.json'));
        }
        catch (e) {
            // do nothing
        }
        try {
            if (options.in) {
                inPackageJson = yield fse.readJson(path.join(inDir, 'package.json'));
            }
        }
        catch (e) {
            // do nothing
        }
        try {
            inBowerJson = yield fse.readJson(path.join(inDir, 'bower.json'));
        }
        catch (e) {
            // do nothing
        }
        let npmPackageName = options['npm-name'] ||
            inPackageJson && inPackageJson.name ||
            outPackageJson && outPackageJson.name;
        let npmPackageVersion = options['npm-version'] ||
            inPackageJson && inPackageJson.version ||
            outPackageJson && outPackageJson.version;
        // Prompt user for new package name & version if none exists
        // TODO(fks) 07-19-2017: Add option to suppress prompts
        if (typeof npmPackageName !== 'string') {
            npmPackageName = (yield inquirer.prompt([{
                    type: 'input',
                    name: 'npm-name',
                    message: 'npm package name?',
                    default: inBowerJson && `@polymer/${inBowerJson.name}`,
                }]))['npm-name'];
        }
        if (typeof npmPackageVersion !== 'string') {
            npmPackageVersion =
                (yield inquirer.prompt([{
                        type: 'input',
                        name: 'npm-version',
                        message: 'npm package version?',
                        default: inBowerJson && semver.inc(inBowerJson.version, 'major'),
                    }]))['npm-version'];
        }
        util_1.logStep(1, 2, '🌀', `Converting Package...`);
        console.log(`Out directory: ${outDir}`);
        yield convert_package_1.default({
            inDir: inDir,
            outDir: outDir,
            excludes: options.exclude,
            deleteFiles: options['delete-files'],
            namespaces: options.namespace,
            npmImportStyle: options['import-style'],
            packageName: npmPackageName.toLowerCase(),
            packageVersion: npmPackageVersion,
            cleanOutDir: options.clean,
            addImportMeta: options['add-import-meta'],
            flat: options.flat,
            private: options.private,
            packageType: options['package-type']
        });
        util_1.logStep(2, 2, '🎉', `Conversion Complete!`);
    });
}
exports.default = run;
//# sourceMappingURL=command-package.js.map