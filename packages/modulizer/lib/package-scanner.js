"use strict";
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
const node_fetch_1 = require("node-fetch");
const polymer_analyzer_1 = require("polymer-analyzer");
const conversion_manifest_1 = require("./conversion-manifest");
const document_converter_1 = require("./document-converter");
const document_scanner_1 = require("./document-scanner");
const import_with_document_1 = require("./import-with-document");
const js_module_1 = require("./js-module");
const package_manifest_1 = require("./package-manifest");
/**
 * PackageScanner provides the top-level interface for scanning any single
 * package. Scanning packages allows us to detect the new ES Module
 * external interface(s) across a project so that we can properly rewrite and
 * convert our files.
 */
class PackageScanner {
    constructor(packageName, analysis, urlHandler, conversionSettings, topLevelEntrypoints) {
        this.topLevelEntrypoints = new Set();
        /**
         * A set of all external dependencies (by name) actually detected as JS
         * imported by this package.
         */
        this.externalDependencies = new Set();
        /**
         * All JS Exports for a single package registered by namespaced identifier,
         * to map implicit HTML imports to explicit named JS imports.
         */
        this.namespacedExports = new Map();
        /**
         * All Scan Results for a single package registered by document URL, so that
         * the conversion process knows how to treat each file.
         */
        this.results = new Map();
        this.packageName = packageName;
        this.analysis = analysis;
        this.urlHandler = urlHandler;
        this.conversionSettings = conversionSettings;
        this.topLevelEntrypoints = topLevelEntrypoints;
    }
    /**
     * Scan a package and return the scan result. This method will first try to
     * fetch a package manifest from npm. Failing that (no manifest exists, npm
     * cannot be reached, etc.) it will scan the package manually.
     */
    scanPackage(forceScan = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsFromManifest;
            if (forceScan !== false) {
                resultsFromManifest = yield this.getResultsFromManifest();
            }
            if (resultsFromManifest !== undefined) {
                this.scanPackageFromManifest(resultsFromManifest);
            }
            else {
                this.scanPackageManually();
            }
            return this.getResults();
        });
    }
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    scanPackageFromManifest(packageScanManifest) {
        for (const [originalUrl, scanResult] of packageScanManifest.files) {
            this.results.set(originalUrl, scanResult);
            if (scanResult.type === 'js-module') {
                for (const expr of scanResult.exportMigrationRecords) {
                    if (!this.namespacedExports.has(expr.oldNamespacedName)) {
                        this.namespacedExports.set(expr.oldNamespacedName, new js_module_1.JsExport(scanResult.convertedUrl, expr.es6ExportName));
                    }
                }
            }
        }
    }
    /**
     * Scan each document in a package manually. The scan document format (JS
     * Module or HTML Document) is determined by whether the file is included in
     * the entry for this package in `conversionSettings.packageEntrypoints` which
     * is assigned to `this.topLevelEntrypoints`.
     */
    scanPackageManually() {
        // Scan top-level entrypoints first, to make sure their dependencies are
        // properly converted to JS modules as well.
        for (const document of this.getPackageHtmlDocuments()) {
            if (this.topLevelEntrypoints.has(this.urlHandler.getDocumentUrl(document))) {
                this.scanDocument(document, 'js-module');
            }
        }
        // Scan all other documents, to be converted as top-level HTML files.
        for (const document of this.getPackageHtmlDocuments()) {
            // If the document was scanned above, don't scan it again. (`scanDocument`
            // also checks this.)
            if (this.shouldScanDocument(document)) {
                this.scanDocument(document, 'html-document');
            }
        }
    }
    /**
     * Fetch a conversion manifest from NPM. If none can be found, return null.
     */
    getResultsFromManifest() {
        return __awaiter(this, void 0, void 0, function* () {
            const npmPackageInfo = package_manifest_1.lookupDependencyMapping(this.packageName);
            if (!npmPackageInfo) {
                return undefined;
            }
            try {
                const unpkgResponse = yield node_fetch_1.default(`https://unpkg.com/${npmPackageInfo.npm}@${npmPackageInfo.semver}/manifest.json`);
                const manifestJson = yield unpkgResponse.json();
                const [allFiles, allExports] = conversion_manifest_1.filesJsonObjectToMap(this.packageName, npmPackageInfo.npm, manifestJson, this.urlHandler);
                return {
                    files: allFiles,
                    exports: allExports,
                };
            }
            catch (err) {
                return undefined;
            }
        });
    }
    /**
     * Get all relevant HTML documents from a package that should be scanned,
     * coverted, or otherwise handled by the modulizer.
     */
    getPackageHtmlDocuments() {
        return [
            ...this.analysis.getFeatures({
                // Set externalPackages=true so that this method works on dependencies
                // packages as well. We filter out files from outside this package in
                // the method below.
                externalPackages: true,
                kind: 'html-document',
            })
        ].filter((d) => {
            // Filter out any inline documents returned by the analyzer
            if (d.isInline === true) {
                return false;
            }
            // Filter out any excluded documents
            const documentUrl = this.urlHandler.getDocumentUrl(d);
            if (this.conversionSettings.excludes.has(documentUrl)) {
                return false;
            }
            // Filter out any documents external *to this package*
            const packageName = this.urlHandler.getOriginalPackageNameForUrl(documentUrl);
            return packageName === this.packageName;
        });
    }
    /**
     * Return the results of the package scan.
     */
    getResults() {
        return {
            files: this.results,
            exports: this.namespacedExports,
        };
    }
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    getConversionManifest() {
        return conversion_manifest_1.serializePackageScanResult(this.results, this.namespacedExports, this.urlHandler);
    }
    /**
     * Scan a document and any of its dependency packages.
     */
    scanDocument(document, scanAs) {
        console.assert(document.kinds.has('html-document'), `scanDocument() must be called with an HTML document, but got ${document.kinds}`);
        if (!this.shouldScanDocument(document)) {
            return;
        }
        const documentScanner = new document_scanner_1.DocumentScanner(document, this.packageName, this.urlHandler, this.conversionSettings);
        let scanResult;
        try {
            scanResult = scanAs === 'js-module' ?
                documentScanner.scanJsModule() :
                documentScanner.scanTopLevelHtmlDocument();
        }
        catch (e) {
            console.error(`Error in ${document.url}`, e);
            return;
        }
        this.results.set(scanResult.originalUrl, scanResult);
        this.scanDependencies(document);
        if (scanResult.type === 'js-module') {
            for (const expr of scanResult.exportMigrationRecords) {
                if (!this.namespacedExports.has(expr.oldNamespacedName)) {
                    this.namespacedExports.set(expr.oldNamespacedName, new js_module_1.JsExport(scanResult.convertedUrl, expr.es6ExportName));
                }
            }
        }
    }
    /**
     * Check if a document is explicitly excluded or has already been scanned
     * to decide if it should be skipped.
     */
    shouldScanDocument(document) {
        const documentUrl = this.urlHandler.getDocumentUrl(document);
        return !this.results.has(documentUrl) &&
            !this.conversionSettings.excludes.has(documentUrl);
    }
    /**
     * Scan dependency files of a document. If a file is external to this package,
     * add that dependency to the externalDependencies set to be scanned
     * seperately.
     */
    scanDependencies(document) {
        const documentUrl = this.urlHandler.getDocumentUrl(document);
        const packageName = this.urlHandler.getOriginalPackageNameForUrl(documentUrl);
        for (const htmlImport of document_converter_1.DocumentConverter.getAllHtmlImports(document)) {
            if (!import_with_document_1.isImportWithDocument(htmlImport)) {
                console.warn(new polymer_analyzer_1.Warning({
                    code: 'import-ignored',
                    message: `Import could not be loaded and will be ignored.`,
                    parsedDocument: document.parsedDocument,
                    severity: polymer_analyzer_1.Severity.WARNING,
                    sourceRange: htmlImport.sourceRange,
                }).toString());
                continue;
            }
            const importDocumentUrl = this.urlHandler.getDocumentUrl(htmlImport);
            const importPackageName = this.urlHandler.getOriginalPackageNameForUrl(importDocumentUrl);
            if (importPackageName === packageName) {
                this.scanDocument(htmlImport.document, 'js-module');
            }
            else {
                this.externalDependencies.add(importPackageName);
            }
        }
    }
}
exports.PackageScanner = PackageScanner;
//# sourceMappingURL=package-scanner.js.map