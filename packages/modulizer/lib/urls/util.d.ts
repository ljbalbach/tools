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
import { ConvertedDocumentFilePath, ConvertedDocumentUrl, OriginalDocumentUrl } from './types';
/**
 * Return true if url is formatted correctly as a OriginalDocumentUrl.
 * All ConvertedDocumentUrls have a `./` prefix, while OriginalDocumentUrl
 * (returned from the Analyzer) has no such prefix.
 */
export declare function isOriginalDocumentUrlFormat(url: string): boolean;
/**
 * Rewrite a url to replace a `.html` file extension with `.js`, if found.
 */
export declare function replaceHtmlExtensionIfFound(url: string): string;
/**
 * Rewrite a url to replace a `.js` file extension with `.html`, if found.
 */
export declare function replaceJsExtensionIfFound(url: string): string;
/**
 * Create a ConvertedDocumentFilePath for the OriginalDocumentUrl of a document
 * being converted to a JS module.
 */
export declare function getJsModuleConvertedFilePath(convertedUrl: ConvertedDocumentFilePath): ConvertedDocumentFilePath;
/**
 * Create a ConvertedDocumentFilePath for the OriginalDocumentUrl of a document
 * being converted to a top-level HTML document. (Note that this is a no-op
 * since HTML documents should keep their current html file extension).
 */
export declare function getHtmlDocumentConvertedFilePath(convertedUrl: ConvertedDocumentFilePath): ConvertedDocumentFilePath;
/**
 * Converts the OriginalDocumentUrl of a file which was a script prior to
 * conversion to its corresponding ConvertedDocumentFilePath.
 *
 * This function's output is affected by any renaming that might have been
 * applied to a file, as opposed to `getJsModuleConvertedFilePath` and
 * `getHtmlDocumentConvertedFilePath`, which consume ConvertedDocumentFilePaths
 * which have already had renaming applied (but which haven't had their
 * extension changed, if needed).
 *
 * TODO(bicknellr): This implementation by casting is only safe because
 * 'polymer.html' is the only file we are renaming currently and this function
 * is only called by `DocumentConverter#convertJsModule` with URLs of files
 * which were already scripts.
 */
export declare function getScriptConvertedFilePath(originalUrl: OriginalDocumentUrl): ConvertedDocumentFilePath;
/**
 * Gets a relative URL from one JS module URL to another. Handles expected
 * formatting and relative/absolute urls.
 */
export declare function getRelativeUrl(fromUrl: ConvertedDocumentUrl, toUrl: ConvertedDocumentUrl): string;
/**
 * Get the import name for an imported module object. Useful when generating an
 * import statement, or a reference to an imported module object.
 */
export declare function getModuleId(url: string): string;
