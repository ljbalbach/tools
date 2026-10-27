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
import { BowerConfig } from './bower-config';
import { YarnConfig } from './npm-config';
interface DependencyMapEntry {
    npm: string;
    semver: string;
}
/**
 * The name of the git branch for local git dependencies to point to. Without
 * a branch name, npm would just install from master.
 */
export declare const localDependenciesBranch = "polymer-modulizer-testing";
/**
 * Save a custom bower->npm dependency mapping for lookup.
 */
export declare function saveDependencyMapping(bowerPackageName: string, npm: string, semver: string): void;
/**
 * Lookup the corresponding npm package name in our local map. By default, this
 * method will log a standard warning message to the user if no mapping was
 * found.
 */
export declare function lookupDependencyMapping(bowerPackageName: string): DependencyMapEntry | undefined;
/**
 * helper function to serialize and parse JSON.
 */
export declare function writeJson(json: object, ...pathPieces: string[]): void;
/**
 * Generate the package.json for a modulized package from its bower.json,
 * optionally merging with an existing package.json.
 *
 * @param bowerJson The package's existing parsed bower.json.
 * @param options Values from here always win over existingPackageJson.
 * @param useLocal Optional map of any NPM dependencies (name -> local file
 * path) that should be referenced via local file path and not public package
 * name in the package.json. This is useful for testing against other, converted
 * repos.
 * @param existingPackageJson Optional pre-existing parsed package.json. If
 * provided, values from this package.json will not be modified, with these
 * exceptions:
 *   - name, version, flat, and private are always overridden.
 *   - dependencies, devDependencies, and resolutions are merged, with newly
 *     generated versions for the same package winning.
 */
export declare function generatePackageJson(bowerJson: Partial<BowerConfig>, options: {
    name: string;
    version: string;
    flat: boolean;
    private: boolean;
}, useLocal?: Map<string, string>, existingPackageJson?: Partial<YarnConfig>): YarnConfig;
export {};
