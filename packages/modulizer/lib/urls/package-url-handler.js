"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const package_manifest_1 = require("../package-manifest");
const util_1 = require("./util");
/**
 * Handle URLs in a single "package-based" layout. This converter should be used
 * to convert a single package, where all existing Bower dependencies are
 * installed in a "bower_components/" sub-directory inside the main package
 * directory.
 */
class PackageUrlHandler {
    /**
     * Helper function to check if a file URL is internal to the main package
     * being converted (vs. a dependency).
     */
    static isUrlInternalToPackage(url) {
        // OriginalDocumentUrl will always be format `bower_components/*`
        // ConvertedDocument[Url|FilePath] will always be format `./node_modules/*`
        return !url.startsWith('bower_components/') &&
            !url.startsWith('./node_modules/');
    }
    constructor(analyzer, bowerPackageName, npmPackageName, packageType, packageDir) {
        this.analyzer = analyzer;
        this.bowerPackageName = bowerPackageName;
        this.npmPackageName = npmPackageName;
        this.packageType = packageType;
        this.packageDir = packageDir;
    }
    getPackageDir(packageName) {
        if (packageName === this.bowerPackageName) {
            return this.packageDir;
        }
        else {
            return path.join(this.packageDir, 'bower_components', packageName);
        }
    }
    /**
     * Return a document url property as a OriginalDocumentUrl type.
     * OriginalDocumentUrl is relative to the project under conversion, unlike
     * the analyzer's ResolvedUrl, which is absolute to the file system.
     */
    getDocumentUrl(document) {
        const relativeUrl = this.analyzer.urlResolver.relative(document.url);
        // If the analyzer URL is outside the current directory, it actually exists
        // in the child bower_components/ directory.
        if (relativeUrl.startsWith('../')) {
            return 'bower_components/' + relativeUrl.substring(3);
        }
        else {
            return relativeUrl;
        }
    }
    /**
     * Get the name of the package where a file lives, based on it's URL. For a
     * workspace, we read the Bower package name from the bower.json of every
     * repo, and then check dependency map to get the new NPM name for that
     * package.
     */
    getOriginalPackageNameForUrl(url) {
        if (url.startsWith('bower_components/')) {
            return url.split('/')[1];
        }
        else {
            return this.bowerPackageName;
        }
    }
    /**
     * Get the "type" for the package where a file lives, based on it's URL.
     */
    getPackageTypeForUrl(url) {
        if (PackageUrlHandler.isUrlInternalToPackage(url)) {
            return this.packageType;
        }
        else {
            return 'element';
        }
    }
    /**
     * Check if two URLs are internal within the same package.
     */
    isImportInternal(fromUrl, toUrl) {
        if (!fromUrl.startsWith('./node_modules') &&
            !toUrl.startsWith('./node_modules')) {
            return true;
        }
        if (fromUrl.startsWith('./node_modules') &&
            toUrl.startsWith('./node_modules')) {
            const fromUrlParts = fromUrl.split('/');
            const toUrlParts = toUrl.split('/');
            if (fromUrlParts[2][0] === '@' && toUrlParts[2][0] === '@') {
                return fromUrlParts[2] === toUrlParts[2] &&
                    fromUrlParts[3] === toUrlParts[3];
            }
            else {
                return fromUrlParts[2] === toUrlParts[2];
            }
        }
        return false;
    }
    /**
     * Rewrite a Bower package name in a URL to its matching npm package name.
     */
    convertUrl(url) {
        if (PackageUrlHandler.isUrlInternalToPackage(url)) {
            // TODO(fks): Revisit this format? The analyzer returns URLs without this
            return ('./' + url);
        }
        const newUrl = url.replace('bower_components/', 'node_modules/');
        const newUrlPieces = newUrl.split('/');
        const bowerPackageName = newUrlPieces[1];
        if (bowerPackageName === this.bowerPackageName) {
            newUrlPieces[1] = this.npmPackageName;
        }
        else {
            const depInfo = package_manifest_1.lookupDependencyMapping(bowerPackageName);
            if (depInfo) {
                newUrlPieces[1] = depInfo.npm;
            }
        }
        return ('./' + newUrlPieces.join('/'));
    }
    /**
     * Create a ConvertedDocumentUrl formatted for the current project layout.
     * Useful when the converted file location is known ahead of time.
     */
    createConvertedUrl(partialUrl) {
        return `./node_modules/${partialUrl}`;
    }
    /**
     * Get the formatted relative import URL between two ConvertedDocumentUrls.
     */
    getPathImportUrl(fromUrl, toUrl) {
        const isPackageNameScoped = this.npmPackageName.startsWith('@');
        const isPackageTypeElement = this.packageType === 'element';
        const isImportFromLocalFile = PackageUrlHandler.isUrlInternalToPackage(fromUrl);
        const isImportToExternalFile = !PackageUrlHandler.isUrlInternalToPackage(toUrl);
        let importUrl = util_1.getRelativeUrl(fromUrl, toUrl);
        // If the import is from the current project:
        if (isImportFromLocalFile && isPackageTypeElement) {
            // Rewrite imports to point to dependencies as if they were siblings.
            if (importUrl.startsWith('./node_modules/')) {
                importUrl = '../' + importUrl.slice('./node_modules/'.length);
            }
            else {
                importUrl = importUrl.replace('node_modules', '..');
            }
            // Account for a npm package name scoping.
            if (isPackageNameScoped && isImportToExternalFile) {
                if (importUrl.startsWith('./')) {
                    importUrl = '../' + importUrl.slice('./'.length);
                }
                else {
                    importUrl = '../' + importUrl;
                }
            }
        }
        return importUrl;
    }
    /**
     * Get the formatted import URL for a name-based conversion.
     *
     * Ex: `./node_modules/@polymer/polymer/foo.js` -> `@polymer/polymer/foo.js`
     */
    getNameImportUrl(url) {
        return url.slice('./node_modules/'.length);
    }
    originalUrlToPackageRelative(url) {
        if (url.startsWith('bower_components/')) {
            return url.split('/').splice(1).join('/');
        }
        else {
            return url;
        }
    }
    convertedUrlToPackageRelative(url) {
        if (url.startsWith('./node_modules/@')) {
            return url.split('/').splice(4).join('/');
        }
        else if (url.startsWith('./node_modules/')) {
            return url.split('/').splice(3).join('/');
        }
        else {
            return url.substring('./'.length);
        }
    }
    convertedDocumentFilePathToPackageRelative(url) {
        return this.originalUrlToPackageRelative(url);
    }
    packageRelativeToOriginalUrl(originalPackageName, url) {
        if (originalPackageName === this.bowerPackageName) {
            return url;
        }
        else {
            return 'bower_components/' + originalPackageName + '/' + url;
        }
    }
    packageRelativeToConvertedUrl(convertedPackageName, url) {
        if (convertedPackageName === this.npmPackageName) {
            return './' + url;
        }
        else {
            return './node_modules/' + convertedPackageName + '/' + url;
        }
    }
    packageRelativeToConvertedDocumentFilePath(packageName, url) {
        return this.packageRelativeToOriginalUrl(packageName, url);
    }
    packageRelativeConvertedUrlToConvertedDocumentFilePath(originalPackageName, url) {
        if (originalPackageName === this.bowerPackageName) {
            return url;
        }
        else {
            return `bower_components/${originalPackageName}/${url}`;
        }
    }
}
exports.PackageUrlHandler = PackageUrlHandler;
//# sourceMappingURL=package-url-handler.js.map