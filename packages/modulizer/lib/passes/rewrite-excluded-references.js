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
const document_util_1 = require("../document-util");
/**
 * Returns true iff the given NodePath is assigned to in an assignment
 * expression.
 */
function isAssigningTo(path) {
    return document_util_1.getPathOfAssignmentTo(path) !== undefined;
}
/**
 * Rewrite references in _referenceExcludes and well known properties that
 * don't work well in modular code.
 */
function rewriteExcludedReferences(program, settings) {
    const mapOfRewrites = new Map(settings.referenceRewrites);
    for (const reference of settings.referenceExcludes) {
        mapOfRewrites.set(reference, jsc.identifier('undefined'));
    }
    /**
     * Rewrite the given path of the given member by `mapOfRewrites`.
     *
     * Never rewrite an assignment to assign to `undefined`.
     */
    const rewrite = (path, memberName) => {
        const replacement = mapOfRewrites.get(memberName);
        if (replacement) {
            if (replacement.type === 'Identifier' &&
                replacement.name === 'undefined' && isAssigningTo(path)) {
                /**
                 * If `path` is a name / pattern that's being written to, we don't
                 * want to rewrite it to `undefined`.
                 */
                return;
            }
            path.replace(replacement);
        }
    };
    astTypes.visit(program, {
        visitMemberExpression(path) {
            const memberPath = document_util_1.getMemberPath(path.node);
            if (memberPath !== undefined) {
                rewrite(path, memberPath.join('.'));
            }
            this.traverse(path);
        },
    });
}
exports.rewriteExcludedReferences = rewriteExcludedReferences;
//# sourceMappingURL=rewrite-excluded-references.js.map