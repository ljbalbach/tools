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
import { ConvertedDocumentFilePath } from './urls/types';
import { UrlHandler } from './urls/url-handler';
/**
 * ProjectConverter provides the top-level interface for running a project
 * conversion. convertDocument() should be called to kick off any conversion,
 * and getResults() should be called once conversion is complete.
 *
 * For best results, only one ProjectConverter instance should be needed, so
 * that it can cache results and avoid duplicate, extraneous document
 * conversions.
 */
export declare class ProjectConverter {
    private readonly urlHandler;
    private readonly conversionSettings;
    private readonly scanner;
    /**
     * A cache of all converted documents. Document conversions should be
     * idempotent, so conversion results can be safely cached.
     */
    private readonly results;
    constructor(analysis: Analysis, urlHandler: UrlHandler, conversionSettings: ConversionSettings);
    /**
     * Convert a package and any of its dependencies.
     */
    convertPackage(packageName: string): Promise<void>;
    /**
     * Get a package manifest (a serializable version of the scanner results) for
     * a package.
     */
    getConversionManifest(packageName: string): Promise<import("./conversion-manifest").PackageScanResultJson>;
    /**
     * Convert a document. The output format (JS Module or HTML Document) is
     * dictated by the results of the scanner.
     */
    private convertDocument;
    /**
     * This method collects the results after all documents are converted. It
     * handles any broken edge-cases and sets empty map entries for files to be
     * deleted.
     */
    getResults(): Map<ConvertedDocumentFilePath, string | undefined>;
}
