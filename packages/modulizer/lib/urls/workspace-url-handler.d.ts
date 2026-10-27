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
import { Analyzer, Document, Import } from 'polymer-analyzer';
import { ConvertedDocumentFilePath, ConvertedDocumentUrl, OriginalDocumentUrl, PackageType } from './types';
import { UrlHandler } from './url-handler';
/**
 * Given a bower.json file (path to be read from) look-up the corresponding
 * package name on NPM. If lookup fails for any reason, default to the repo name
 * or the Bower package name.
 *
 * TODO(fks) 11-06-2017: Failed/bad lookups can cause serious conversion errors,
 * should a failed lookup throw instead of warn?
 */
export declare function lookupNpmPackageName(bowerJsonPath: string): string | undefined;
export declare class WorkspaceUrlHandler implements UrlHandler {
    readonly workspaceDir: string;
    readonly analyzer: Analyzer;
    constructor(analyzer: Analyzer, workspaceDir: string);
    getPackageDir(packageName: string): string;
    /**
     * Return a document url property as a OriginalDocumentUrl type.
     * OriginalDocumentUrl is relative to the project under conversion, unlike
     * the analyzer's ResolvedUrl, which is absolute to the file system.
     */
    getDocumentUrl(document: Document | Import): OriginalDocumentUrl;
    /**
     * Get the name of the package where a file lives, based on it's URL. For a
     * workspace, we read the Bower package name from the bower.json of every
     * repo, and then check dependency map to get the new NPM name for that
     * package.
     */
    getOriginalPackageNameForUrl(url: OriginalDocumentUrl): string;
    /**
     * Get the "type" for the package where a file lives, based on it's URL.
     */
    getPackageTypeForUrl(): PackageType;
    /**
     * Check if two URLs are internal within the same package.
     */
    isImportInternal(fromUrl: ConvertedDocumentUrl, toUrl: ConvertedDocumentUrl): boolean;
    /**
     * Rewrite a bower package name in a URL to its matching npm package name.
     */
    convertUrl(dependencyUrl: OriginalDocumentUrl): ConvertedDocumentUrl;
    /**
     * Create a ConvertedDocumentUrl formatted for the current project layout.
     * Useful when the converted file location is known ahead of time.
     */
    createConvertedUrl(partialUrl: string): ConvertedDocumentUrl;
    /**
     * Get the formatted relative import URL between two ConvertedDocumentUrls.
     */
    getPathImportUrl(fromUrl: ConvertedDocumentUrl, toUrl: ConvertedDocumentUrl): string;
    /**
     * Get the formatted import URL for a name-based conversion.
     *
     * Ex: `./@polymer/polymer/foo.js` -> `@polymer/polymer/foo.js`
     */
    getNameImportUrl(url: ConvertedDocumentUrl): ConvertedDocumentUrl;
    originalUrlToPackageRelative(url: OriginalDocumentUrl): string;
    convertedUrlToPackageRelative(url: ConvertedDocumentUrl): string;
    convertedDocumentFilePathToPackageRelative(url: ConvertedDocumentFilePath): string;
    packageRelativeToOriginalUrl(originalPackageName: string, url: string): OriginalDocumentUrl;
    packageRelativeToConvertedUrl(convertedPackageName: string, url: string): ConvertedDocumentUrl;
    packageRelativeToConvertedDocumentFilePath(packageName: string, url: string): ConvertedDocumentFilePath;
    packageRelativeConvertedUrlToConvertedDocumentFilePath(originalPackageName: string, url: string): ConvertedDocumentFilePath;
}
