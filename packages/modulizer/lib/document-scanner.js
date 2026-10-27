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
Object.defineProperty(exports, "__esModule", { value: true });
const polymer_analyzer_1 = require("polymer-analyzer");
const document_processor_1 = require("./document-processor");
const import_with_document_1 = require("./import-with-document");
const rewrite_namespace_exports_1 = require("./passes/rewrite-namespace-exports");
const util_1 = require("./urls/util");
/**
 * Processes a document to determine a ScanResult for it.
 */
class DocumentScanner extends document_processor_1.DocumentProcessor {
    /**
     * Scan a document's new interface as a JS Module.
     */
    scanJsModule() {
        if (this._isWrapperHTMLDocument) {
            return {
                type: 'delete-file',
                originalUrl: this.originalUrl,
                convertedUrl: undefined,
                convertedFilePath: undefined,
            };
        }
        const { exportMigrationRecords } = rewrite_namespace_exports_1.rewriteNamespacesAsExports(this.program, this.document, this.conversionSettings.namespaces);
        return {
            type: 'js-module',
            originalUrl: this.originalUrl,
            convertedUrl: this.convertedUrl,
            convertedFilePath: this.convertedFilePath,
            exportMigrationRecords,
        };
    }
    /**
     * Scan a document as a top-level HTML document. Top-level HTML documents
     * have no exports to scan, so this returns a simple object containing
     * relevant url mapping information.
     */
    scanTopLevelHtmlDocument() {
        return {
            type: 'html-document',
            convertedUrl: this.convertedUrl,
            originalUrl: this.originalUrl,
            convertedFilePath: util_1.getHtmlDocumentConvertedFilePath(this.convertedFilePath),
        };
    }
    /**
     * Determines if a document is just a wrapper around a script tag pointing
     * to an external script of the same name as this file.
     */
    get _isWrapperHTMLDocument() {
        const allFeatures = Array.from(this.document.getFeatures())
            .filter((f) => !(f.kinds.has('html-document') &&
            f.isInline === false));
        if (allFeatures.length === 1) {
            const f = allFeatures[0];
            if (f.kinds.has('html-script')) {
                const scriptImport = f;
                if (!import_with_document_1.isImportWithDocument(scriptImport)) {
                    console.warn(new polymer_analyzer_1.Warning({
                        code: 'import-ignored',
                        message: `Import could not be loaded and will be ignored.`,
                        parsedDocument: this.document.parsedDocument,
                        severity: polymer_analyzer_1.Severity.WARNING,
                        sourceRange: scriptImport.sourceRange,
                    }).toString());
                    return false;
                }
                const oldScriptUrl = this.urlHandler.getDocumentUrl(scriptImport.document);
                const newScriptUrl = this.convertScriptUrl(oldScriptUrl);
                return newScriptUrl === this.convertedUrl;
            }
        }
        return false;
    }
}
exports.DocumentScanner = DocumentScanner;
//# sourceMappingURL=document-scanner.js.map