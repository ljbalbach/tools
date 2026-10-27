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
const astTypes = require("ast-types");
const jsc = require("jscodeshift");
/**
 * Rewrite `this` references to the explicit namespaceReference identifier
 * within a single BlockStatement if they are the start of a member expression,
 * otherwise they are rewritten to `undefined`. Don't traverse deeper into new
 * scopes.
 */
function rewriteSingleScopeThisReferences(blockStatement, namespaceReference) {
    astTypes.visit(blockStatement, {
        visitThisExpression(path) {
            const parent = path.parent;
            if (parent && parent.node.type !== 'MemberExpression') {
                // When a namespace object is itself referenced with `this` but isn't
                // used to reference a member of the namespace, rewrite the `this` to
                // `undefined`:
                path.replace(jsc.identifier('undefined'));
            }
            else {
                path.replace(jsc.identifier(namespaceReference));
            }
            return false;
        },
        visitFunctionExpression(_path) {
            // Don't visit into new scopes
            return false;
        },
        visitFunctionDeclaration(_path) {
            // Don't visit into new scopes
            return false;
        },
        visitMethodDefinition(_path) {
            // Don't visit into new scopes
            return false;
        },
    });
}
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
function rewriteNamespaceThisReferences(program, namespaceName) {
    astTypes.visit(program, {
        visitExportNamedDeclaration: (path) => {
            if (path.node.declaration &&
                path.node.declaration.type === 'FunctionDeclaration') {
                rewriteSingleScopeThisReferences(path.node.declaration.body, namespaceName);
            }
            return false;
        },
        visitExportDefaultDeclaration: (path) => {
            if (path.node.declaration &&
                path.node.declaration.type === 'FunctionDeclaration') {
                rewriteSingleScopeThisReferences(path.node.declaration.body, namespaceName);
            }
            return false;
        },
    });
}
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
function rewriteNamespacesThisReferences(program, namespaceNames) {
    for (const namespaceName of namespaceNames) {
        rewriteNamespaceThisReferences(program, namespaceName);
    }
}
exports.rewriteNamespacesThisReferences = rewriteNamespacesThisReferences;
//# sourceMappingURL=rewrite-namespace-this-references.js.map