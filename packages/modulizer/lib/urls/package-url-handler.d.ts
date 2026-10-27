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
 * Handle URLs in a single "package-based" layout. This converter should be used
 * to convert a single package, where all existing Bower dependencies are
 * installed in a "bower_components/" sub-directory inside the main package
 * directory.
 */
export declare class PackageUrlHandler implements UrlHandler {
    readonly packageDir: string;
    readonly bowerPackageName: string;
    readonly npmPackageName: string;
    readonly packageType: PackageType;
    readonly analyzer: Analyzer;
    /**
     * Helper function to check if a file URL is internal to the main package
     * being converted (vs. a dependency).
     */
    static isUrlInternalToPackage(url: ConvertedDocumentUrl | OriginalDocumentUrl | ConvertedDocumentFilePath): boolean;
    constructor(analyzer: Analyzer, bowerPackageName: string, npmPackageName: string, packageType: PackageType, packageDir: string);
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
    getPackageTypeForUrl(url: OriginalDocumentUrl): PackageType;
    /**
     * Check if two URLs are internal within the same package.
     */
    isImportInternal(fromUrl: ConvertedDocumentUrl, toUrl: ConvertedDocumentUrl): boolean;
    /**
     * Rewrite a Bower package name in a URL to its matching npm package name.
     */
    convertUrl(url: OriginalDocumentUrl): ConvertedDocumentUrl;
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
     * Ex: `./node_modules/@polymer/polymer/foo.js` -> `@polymer/polymer/foo.js`
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
