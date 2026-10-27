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
import { PartialConversionSettings } from './conversion-settings';
import { PackageType } from './urls/types';
/**
 * Configuration options required for package-layout conversions. Contains
 * information about the package under conversion, including what files to
 * convert, its new package name, and its new npm version number.
 */
export interface PackageConversionSettings extends PartialConversionSettings {
    readonly packageName: string;
    readonly packageVersion: string;
    readonly packageType: PackageType;
    readonly inDir: string;
    readonly outDir: string;
    readonly cleanOutDir?: boolean;
}
/**
 * Convert a package-layout project to JavaScript modules & npm.
 */
export default function convert(options: PackageConversionSettings): Promise<void>;
