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
import { Program } from 'estree';
import { Document, ParsedHtmlDocument } from 'polymer-analyzer';
import { ConversionSettings } from './conversion-settings';
import { ImportWithDocument } from './import-with-document';
import { ConvertedDocumentFilePath, ConvertedDocumentUrl, OriginalDocumentUrl } from './urls/types';
import { UrlHandler } from './urls/url-handler';
/**
 * An abstract superclass for our document scanner and document converters.
 */
export declare abstract class DocumentProcessor {
    protected readonly originalPackageName: string;
    protected readonly originalUrl: OriginalDocumentUrl;
    /**
     * N.B. that this converted url always points to .js, even if this document
     * will be converted to an HTML file.
     */
    protected readonly convertedUrl: ConvertedDocumentUrl;
    protected readonly convertedFilePath: ConvertedDocumentFilePath;
    protected readonly urlHandler: UrlHandler;
    protected readonly conversionSettings: ConversionSettings;
    protected readonly document: Document<ParsedHtmlDocument>;
    protected readonly program: Program;
    protected readonly convertedHtmlScripts: ReadonlySet<ImportWithDocument>;
    protected readonly leadingCommentsToPrepend: string[] | undefined;
    constructor(document: Document<ParsedHtmlDocument>, originalPackageName: string, urlHandler: UrlHandler, conversionSettings: ConversionSettings);
    private isInternalNonModuleImport;
    /**
     * Creates a single program from all the JavaScript in the current document.
     * The standard program result can be used for either scanning or conversion.
     *
     * TODO: this does a lot of mutation of the program. Could we only do that
     *   when we're converting, and not when we're scanning?
     */
    private prepareJsModule;
    /**
     * Recreate the HTML contents from the original HTML document by adding
     * code to the top of program that constructs equivalent DOM and insert
     * it into `window.document`.
     */
    private insertCodeToGenerateHtmlElements;
    /**
     * Find Polymer element templates in the original HTML. Insert these
     * templates as strings as part of the javascript element declaration.
     */
    private inlineTemplates;
    /**
     * Adds a static importMeta property to Polymer elements.
     */
    private addImportMetaToElements;
    /**
     * Converts an HTML Document's path from old world to new. Use new NPM naming
     * as needed in the path, and change any .html extension to .js.
     */
    protected convertDocumentUrl(htmlUrl: OriginalDocumentUrl): ConvertedDocumentUrl;
    /**
     * Converts the URL for a script that is already being loaded in a
     * pre-conversion HTML document via the <script> tag. This is similar to
     * convertDocumentUrl(), but can skip some of the more complex .html -> .js
     * conversion/rewriting.
     */
    protected convertScriptUrl(oldUrl: OriginalDocumentUrl): ConvertedDocumentUrl;
}
