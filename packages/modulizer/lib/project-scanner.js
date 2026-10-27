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
const js_module_1 = require("./js-module");
const package_scanner_1 = require("./package-scanner");
/**
 * ProjectScanner provides the top-level interface for scanning packages and
 * their dependencies. Scanning packages allows us to detect the new ES Module
 * external interface(s) across a project so that we can properly rewrite and
 * convert our files.
 *
 * For best results, only one ProjectScanner instance should be needed, so
 * that it can cache results and avoid duplicate, extraneous document
 * conversions.
 *
 * ProjectScanner is indifferent to the layout of the project, delegating any
 * special URL handling/resolution to the urlHandler provided to the
 * constructor.
 */
class ProjectScanner {
    constructor(analysis, urlHandler, conversionSettings) {
        this.scannedPackages = new Map();
        this.analysis = analysis;
        this.urlHandler = urlHandler;
        this.conversionSettings = conversionSettings;
    }
    /**
     * Get all relevant HTML documents from a package that should be scanned,
     * coverted, or otherwise handled by the modulizer.
     */
    getPackageHtmlDocuments(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.scannedPackages.has(packageName)) {
                yield this.scanPackage(packageName);
            }
            const packageScanner = this.scannedPackages.get(packageName);
            return packageScanner.getPackageHtmlDocuments();
        });
    }
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    getConversionManifest(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.scannedPackages.has(packageName)) {
                yield this.scanPackage(packageName);
            }
            const packageScanner = this.scannedPackages.get(packageName);
            return packageScanner.getConversionManifest();
        });
    }
    /**
     * Reads the entrypoints for a package from the `main` field in the package's
     * 'bower.json' file.
     */
    readBowerJsonEntrypoints(bowerPackageName) {
        return __awaiter(this, void 0, void 0, function* () {
            const bowerJsonPath = path.join(this.urlHandler.getPackageDir(bowerPackageName), 'bower.json');
            let bowerJson = undefined;
            try {
                bowerJson = (yield fse.readJSON(bowerJsonPath));
            }
            catch (_a) {
                console.warn(`Failed to read entrypoints of package '${bowerPackageName}' ` +
                    `because the package does not have a 'bower.json' file.`);
            }
            let bowerMainFiles = bowerJson ? bowerJson.main : [];
            if (typeof bowerMainFiles === 'string') {
                bowerMainFiles = [bowerMainFiles];
            }
            else if (bowerMainFiles === undefined) {
                bowerMainFiles = [];
            }
            return bowerMainFiles.map((relativeOriginalUrl) => this.urlHandler.packageRelativeToOriginalUrl(bowerPackageName, relativeOriginalUrl));
        });
    }
    /**
     * Scan a document and any of its dependency packages for their new interface.
     */
    scanPackage(bowerPackageName, forceScan = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.scannedPackages.has(bowerPackageName)) {
                return;
            }
            // If the package has custom entrypoints listed in the conversion settings,
            // use those. Otherwise, read them from the package's 'bower.json'.
            const topLevelEntrypoints = this.conversionSettings.packageEntrypoints.get(bowerPackageName) ||
                (yield this.readBowerJsonEntrypoints(bowerPackageName));
            const packageScanner = new package_scanner_1.PackageScanner(bowerPackageName, this.analysis, this.urlHandler, this.conversionSettings, new Set(topLevelEntrypoints));
            yield packageScanner.scanPackage(forceScan);
            // Add this scanner to our cache so that it won't get double scanned.
            this.scannedPackages.set(bowerPackageName, packageScanner);
            // Scan all dependencies of this package as well.
            for (const externalDependencyName of packageScanner.externalDependencies) {
                yield this.scanPackage(externalDependencyName, false);
            }
        });
    }
    getResults() {
        const allResults = [...this.scannedPackages.values()].map((scanner) => scanner.getResults());
        const allFiles = new Map();
        const allExports = new Map();
        for (const result of allResults) {
            for (const [fileOriginalUrl, scanResult] of result.files) {
                allFiles.set(fileOriginalUrl, scanResult);
            }
            for (const [exportName, exportInfo] of result.exports) {
                if (allExports.has(exportName)) {
                    console.warn(`CONFLICT: JS Export ${exportName} claimed by two packages: ${exportInfo.url} & ${allExports.get(exportName).url}`);
                }
                allExports.set(exportName, new js_module_1.JsExport(exportInfo.url, exportInfo.name));
            }
        }
        return {
            files: allFiles,
            exports: allExports,
        };
    }
}
exports.ProjectScanner = ProjectScanner;
//# sourceMappingURL=project-scanner.js.map