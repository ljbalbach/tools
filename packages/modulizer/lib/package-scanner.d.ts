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
import { Analysis, Document, ParsedHtmlDocument } from 'polymer-analyzer';
import { PackageScanResultJson } from './conversion-manifest';
import { ConversionSettings } from './conversion-settings';
import { ScanResult } from './document-scanner';
import { JsExport } from './js-module';
import { OriginalDocumentUrl } from './urls/types';
import { UrlHandler } from './urls/url-handler';
export declare type PackageScanFiles = Map<OriginalDocumentUrl, ScanResult>;
export declare type PackageScanExports = Map<string, JsExport>;
export interface PackageScanResult {
    files: PackageScanFiles;
    exports: PackageScanExports;
}
/**
 * PackageScanner provides the top-level interface for scanning any single
 * package. Scanning packages allows us to detect the new ES Module
 * external interface(s) across a project so that we can properly rewrite and
 * convert our files.
 */
export declare class PackageScanner {
    private readonly packageName;
    private readonly analysis;
    private readonly urlHandler;
    private readonly conversionSettings;
    private readonly topLevelEntrypoints;
    /**
     * A set of all external dependencies (by name) actually detected as JS
     * imported by this package.
     */
    readonly externalDependencies: Set<string>;
    /**
     * All JS Exports for a single package registered by namespaced identifier,
     * to map implicit HTML imports to explicit named JS imports.
     */
    private readonly namespacedExports;
    /**
     * All Scan Results for a single package registered by document URL, so that
     * the conversion process knows how to treat each file.
     */
    private readonly results;
    constructor(packageName: string, analysis: Analysis, urlHandler: UrlHandler, conversionSettings: ConversionSettings, topLevelEntrypoints: Set<OriginalDocumentUrl>);
    /**
     * Scan a package and return the scan result. This method will first try to
     * fetch a package manifest from npm. Failing that (no manifest exists, npm
     * cannot be reached, etc.) it will scan the package manually.
     */
    scanPackage(forceScan?: boolean): Promise<PackageScanResult>;
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    private scanPackageFromManifest;
    /**
     * Scan each document in a package manually. The scan document format (JS
     * Module or HTML Document) is determined by whether the file is included in
     * the entry for this package in `conversionSettings.packageEntrypoints` which
     * is assigned to `this.topLevelEntrypoints`.
     */
    scanPackageManually(): void;
    /**
     * Fetch a conversion manifest from NPM. If none can be found, return null.
     */
    getResultsFromManifest(): Promise<PackageScanResult | undefined>;
    /**
     * Get all relevant HTML documents from a package that should be scanned,
     * coverted, or otherwise handled by the modulizer.
     */
    getPackageHtmlDocuments(): Document<ParsedHtmlDocument>[];
    /**
     * Return the results of the package scan.
     */
    getResults(): PackageScanResult;
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    getConversionManifest(): PackageScanResultJson;
    /**
     * Scan a document and any of its dependency packages.
     */
    private scanDocument;
    /**
     * Check if a document is explicitly excluded or has already been scanned
     * to decide if it should be skipped.
     */
    private shouldScanDocument;
    /**
     * Scan dependency files of a document. If a file is external to this package,
     * add that dependency to the externalDependencies set to be scanned
     * seperately.
     */
    private scanDependencies;
}
