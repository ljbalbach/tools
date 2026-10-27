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
const conversion_settings_1 = require("./conversion-settings");
const gitignore_1 = require("./gitignore");
const package_manifest_1 = require("./package-manifest");
const project_converter_1 = require("./project-converter");
const special_casing_1 = require("./special-casing");
const travis_config_1 = require("./travis-config");
const package_url_handler_1 = require("./urls/package-url-handler");
const util_1 = require("./util");
/**
 * Create and/or clean the "out" directory, setting it up for conversion.
 */
function setupOutDir(outDir, clean = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (clean) {
            yield util_1.rimraf(outDir);
        }
        try {
            yield util_1.mkdirp(outDir);
        }
        catch (e) {
            if (e.errno === -17) {
                // directory exists, do nothing
            }
            else {
                throw e;
            }
        }
    });
}
/**
 * Configure a basic analyzer instance for the package under conversion.
 */
function configureAnalyzer(options) {
    const urlResolver = new polymer_analyzer_1.PackageUrlResolver();
    const urlLoader = new polymer_analyzer_1.InMemoryOverlayUrlLoader(new polymer_analyzer_1.FsUrlLoader(options.inDir));
    for (const [url, contents] of special_casing_1.polymerFileOverrides) {
        urlLoader.urlContentsMap.set(urlResolver.resolve(url), contents);
        urlLoader.urlContentsMap.set(urlResolver.resolve(`../polymer/${url}`), contents);
    }
    return new polymer_analyzer_1.Analyzer({
        urlLoader,
        urlResolver,
    });
}
/**
 * Convert a package-layout project to JavaScript modules & npm.
 */
function convert(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const outDir = options.outDir;
        const npmPackageName = options.packageName;
        yield setupOutDir(outDir, options.cleanOutDir);
        // Configure the analyzer and run an analysis of the package.
        const bowerJson = yield fse.readJSON(path.join(options.inDir, 'bower.json'));
        const bowerPackageName = bowerJson.name;
        const analyzer = configureAnalyzer(options);
        const analysis = yield analyzer.analyzePackage();
        yield setupOutDir(options.outDir, !!options.cleanOutDir);
        // Create the url handler & converter.
        const urlHandler = new package_url_handler_1.PackageUrlHandler(analyzer, bowerPackageName, npmPackageName, options.packageType, options.inDir);
        const conversionSettings = conversion_settings_1.createDefaultConversionSettings(analysis, options);
        const converter = new project_converter_1.ProjectConverter(analysis, urlHandler, conversionSettings);
        // Convert the package
        yield converter.convertPackage(bowerPackageName);
        // Filter out external results before writing them to disk.
        const results = converter.getResults();
        for (const [newPath] of results) {
            if (!package_url_handler_1.PackageUrlHandler.isUrlInternalToPackage(newPath)) {
                results.delete(newPath);
            }
        }
        yield util_1.writeFileResults(outDir, results);
        // transform travis config
        yield travis_config_1.transformTravisConfig(options.inDir, options.outDir);
        // add `node_modules` to gitignore
        const gitIgnoreFile = path.join(options.inDir, '.gitignore');
        yield gitignore_1.ignoreNodeModules(gitIgnoreFile);
        const packageJsonPath = path.join(options.inDir, 'package.json');
        const existingPackageJson = yield util_1.readJsonIfExists(packageJsonPath);
        // Generate a new package.json, and write it to disk.
        const packageJson = package_manifest_1.generatePackageJson(bowerJson, {
            name: options.packageName,
            version: options.packageVersion,
            flat: options.flat,
            private: options.private,
        }, undefined, existingPackageJson);
        package_manifest_1.writeJson(packageJson, packageJsonPath);
        // Delete files that were explicitly requested to be deleted.
        if (options.deleteFiles !== undefined) {
            yield util_1.deleteGlobsSafe(options.deleteFiles, outDir);
        }
        // TODO(fks): create a new manifest.json, and write it to disk.
        // Currently blocked by the fact that package-url-handler treats all
        // dependencies as local/internal.
    });
}
exports.default = convert;
//# sourceMappingURL=convert-package.js.map