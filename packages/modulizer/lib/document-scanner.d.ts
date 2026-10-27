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
import { DocumentProcessor } from './document-processor';
import { NamespaceMemberToExport } from './js-module';
import { ConvertedDocumentFilePath, ConvertedDocumentUrl, OriginalDocumentUrl } from './urls/types';
export declare type ScanResult = JsModuleScanResult | DeleteFileScanResult | HtmlDocumentScanResult;
/**
 * Contains information about how an existing file should be converted to a new
 * JS Module. Includes a mapping of its new exports.
 */
export interface JsModuleScanResult {
    type: 'js-module';
    originalUrl: OriginalDocumentUrl;
    convertedUrl: ConvertedDocumentUrl;
    convertedFilePath: ConvertedDocumentFilePath;
    exportMigrationRecords: NamespaceMemberToExport[];
}
/**
 * Contains information that an existing file should be deleted during
 * conversion.
 */
export interface DeleteFileScanResult {
    type: 'delete-file';
    originalUrl: OriginalDocumentUrl;
    convertedUrl: undefined;
    convertedFilePath: undefined;
}
/**
 * Contains information that an existing file should be converted as a top-level
 * HTML file (and not as a new JS module).
 */
export interface HtmlDocumentScanResult {
    type: 'html-document';
    originalUrl: OriginalDocumentUrl;
    convertedUrl: ConvertedDocumentUrl;
    convertedFilePath: ConvertedDocumentFilePath;
}
/**
 * Processes a document to determine a ScanResult for it.
 */
export declare class DocumentScanner extends DocumentProcessor {
    /**
     * Scan a document's new interface as a JS Module.
     */
    scanJsModule(): DeleteFileScanResult | JsModuleScanResult;
    /**
     * Scan a document as a top-level HTML document. Top-level HTML documents
     * have no exports to scan, so this returns a simple object containing
     * relevant url mapping information.
     */
    scanTopLevelHtmlDocument(): HtmlDocumentScanResult;
    /**
     * Determines if a document is just a wrapper around a script tag pointing
     * to an external script of the same name as this file.
     */
    private readonly _isWrapperHTMLDocument;
}
