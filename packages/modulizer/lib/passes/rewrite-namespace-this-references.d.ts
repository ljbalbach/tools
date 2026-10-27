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
 * Rewrite `this` references that refer to the namespace object. Replace
 * with an explicit reference to the namespace. This simplifies the rest of
 * our transform pipeline by letting it assume that all namespace references
 * are explicit.
 *
 * NOTE(fks): References to the namespace object still need to be corrected
 * after this step, so timing is important: Only run after exports have
 * been created, but before all namespace references are corrected.
 */
export declare function rewriteNamespacesThisReferences(program: estree.Program, namespaceNames: Set<string>): void;
