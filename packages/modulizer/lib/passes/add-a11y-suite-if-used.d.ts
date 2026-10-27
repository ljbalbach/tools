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
import * as estree from 'estree';
/**
 * Rewrite references in a program from their original names to the local names
 * based on the new named exports system.
 *
 * TODO(fks): This standalone A11ySuite handling could be brought into normal
 * `collectNamespacedReferences()` logic if we added `A11ySuite()` to the known
 * export graph.
 */
export declare function addA11ySuiteIfUsed(program: estree.Program, a11ySuiteUrl: string): boolean;
