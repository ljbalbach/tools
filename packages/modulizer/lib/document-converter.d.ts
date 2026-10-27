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
import { Document, Import } from 'polymer-analyzer';
import { DocumentProcessor } from './document-processor';
import { ConversionResult, JsExport } from './js-module';
/**
 * Converts a Document from Bower to NPM. This supports converting HTML files
 * to JS Modules (using JavaScript import/export statements) or the more simple
 * HTML -> HTML conversion.
 */
export declare class DocumentConverter extends DocumentProcessor {
    /**
     * Returns ALL HTML Imports from a document. Note that this may return imports
     * to documents that are meant to be ignored/excluded during conversion. It
     * it is up to the caller to filter out any unneccesary/excluded documents.
     */
    static getAllHtmlImports(document: Document): Import[];
    /**
     * Returns the HTML Imports from a document, except imports to documents
     * specifically excluded in the ConversionSettings.
     *
     * Note: Imports that are not found are not returned by the analyzer.
     */
    private getHtmlImports;
    /**
     * Convert a document to a JS Module.
     */
    convertJsModule(namespacedExports: Map<string, JsExport>): ConversionResult[];
    /**
     * Convert a document to a top-level HTML document.
     */
    convertTopLevelHtmlDocument(namespacedExports: Map<string, JsExport>): ConversionResult;
    /**
     * Create a ConversionResult object to delete the file instead of converting
     * it.
     */
    createDeleteResult(): ConversionResult;
    /**
     * Rewrite an inline script that will exist inlined inside an HTML document.
     * Should not be called on top-level JS Modules.
     */
    private rewriteInlineScript;
    private convertStylesToScriptsThatInsertThem;
    /**
     * Rewrite namespaced references to the imported name. e.g. changes
     * Polymer.Element -> $Element
     *
     * Returns a map of from url to identifier of the references we should
     * import.
     */
    private collectNamespacedReferences;
    private warnOnDangerousReferences;
    /**
     * Checks if a path points to webcomponents-lite.js and will change it to
     * webcomponents-bundle.js if it does.
     *
     * @param filePath path to transform.
     */
    private webcomponentsLiteToBundle;
    /**
     * Format an import from the current document to the given JS URL. If an
     * original HTML import URL is given, attempt to match the format of that
     * import URL as much as possible. For example, if the original import URL was
     * an absolute path, return an absolute path as well.
     *
     * TODO(fks): Make this run on Windows/Non-Unix systems (#236)
     */
    private formatImportUrl;
    /**
     * Injects JS imports at the top of the program based on html imports and
     * the imports in this.module.importedReferences.
     */
    private addJsImports;
}
