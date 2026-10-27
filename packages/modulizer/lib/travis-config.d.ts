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
/**
 * Modify a project's travis config to remove `bower` commands
 * and ensure the testing commands use the `--npm` flag.
 *
 * @param inDir Root path to search for travis config
 * @param outDir Root path of output travis config
 */
export declare function transformTravisConfig(inDir: string, outDir: string): Promise<void>;
