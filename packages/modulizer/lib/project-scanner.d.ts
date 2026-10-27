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
import { Analysis } from 'polymer-analyzer';
import { ConversionSettings } from './conversion-settings';
import { ScanResult } from './document-scanner';
import { JsExport } from './js-module';
import { OriginalDocumentUrl } from './urls/types';
import { UrlHandler } from './urls/url-handler';
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
export declare class ProjectScanner {
    private readonly analysis;
    private readonly urlHandler;
    private readonly conversionSettings;
    private readonly scannedPackages;
    constructor(analysis: Analysis, urlHandler: UrlHandler, conversionSettings: ConversionSettings);
    /**
     * Get all relevant HTML documents from a package that should be scanned,
     * coverted, or otherwise handled by the modulizer.
     */
    getPackageHtmlDocuments(packageName: string): Promise<import("polymer-analyzer").Document<import("polymer-analyzer").ParsedHtmlDocument>[]>;
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    getConversionManifest(packageName: string): Promise<import("./conversion-manifest").PackageScanResultJson>;
    /**
     * Reads the entrypoints for a package from the `main` field in the package's
     * 'bower.json' file.
     */
    private readBowerJsonEntrypoints;
    /**
     * Scan a document and any of its dependency packages for their new interface.
     */
    scanPackage(bowerPackageName: string, forceScan?: boolean): Promise<void>;
    getResults(): {
        files: Map<OriginalDocumentUrl, ScanResult>;
        exports: Map<string, JsExport>;
    };
}
