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
import { ExecResult } from './util/exec';
export declare class NpmPackage {
    dir: string;
    constructor(dir: string);
    /**
     * Return the current user logged in to npm.
     */
    whoami(): Promise<string>;
    /**
     * Return the current package manifest. Throws if there are any issues
     * reading/parsing the file contents.
     */
    getPackageManifest(): Promise<any>;
    /**
     * Run `npm publish` in the package directory. A tag name is required
     * (use "latest" to mimic the npm default).
     */
    publishToNpm(tagName: string): Promise<ExecResult>;
}
