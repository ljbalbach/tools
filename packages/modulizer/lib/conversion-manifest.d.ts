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
import { PackageScanExports, PackageScanFiles } from './package-scanner';
import { UrlHandler } from './urls/url-handler';
declare type FileExportJson = {
    [originalExportId: string]: string;
};
interface PackageFileJson {
    convertedUrl: string;
    exports: FileExportJson;
}
declare type PackageFilesJson = {
    [originalFilePath: string]: null | PackageFileJson;
};
export interface PackageScanResultJson {
    files: PackageFilesJson;
}
/**
 * Convert a map of files to a serializable JSON object.
 */
export declare function serializePackageScanResult(filesMap: PackageScanFiles, exportsMap: PackageScanExports, urlHandler: UrlHandler): PackageScanResultJson;
export declare function filesJsonObjectToMap(originalPackageName: string, convertedPackageName: string, conversionManifest: PackageScanResultJson, urlHandler: UrlHandler): [PackageScanFiles, PackageScanExports];
export {};
