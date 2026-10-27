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
import { NpmImportStyle, PackageType } from '../conversion-settings';
export interface CliOptions {
    repo?: string[];
    help?: boolean;
    version?: boolean;
    out: string;
    'in'?: string;
    namespace?: string[];
    exclude: string[];
    'delete-files': string[];
    'dependency-mapping': string[];
    'npm-name'?: string;
    'npm-version'?: string;
    clean: boolean;
    'workspace-dir': string;
    'github-token'?: string;
    force: boolean;
    install: boolean;
    test: boolean;
    push: boolean;
    publish: boolean;
    'import-style': NpmImportStyle;
    'add-import-meta': boolean;
    flat: boolean;
    'private': boolean;
    'package-type': PackageType;
}
export declare function run(): Promise<void>;
