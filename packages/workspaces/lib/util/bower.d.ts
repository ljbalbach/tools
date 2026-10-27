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
/**
 * @returns a dictionary object of dev dependencies from the bower.json
 * entries in all workspace repos that are marked for test, suitable for
 * serializing into the devDependencies key of a generated bower.json file
 * for the workspace dir.
 *
 * TODO(usergenic): Merge strategy blindly overwrites previous value for key
 * with whatever new value it encounters as we iterate through bower configs
 * which may not be what we want.  Preserving the
 * highest semver value is *probably* the desired approach
 * instead.
 */
export declare function mergedBowerConfigsFromRepos(repos: {
    dir: string;
}[]): {
    name: string;
    dependencies: {
        [key: string]: string;
    };
    resolutions: {
        [key: string]: string;
    };
};
