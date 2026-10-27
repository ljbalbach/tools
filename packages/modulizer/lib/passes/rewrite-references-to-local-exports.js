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
const ix_1 = require("ix");
const jsc = require("jscodeshift");
const document_util_1 = require("../document-util");
/**
 * Rewrite references in a program from their original names to the local names
 * based on the new named exports system.
 */
function rewriteReferencesToLocalExports(program, exportMigrationRecords) {
    const rewriteMap = new Map(ix_1.Iterable.from(exportMigrationRecords)
        .filter((m) => m.es6ExportName !== '*')
        .map((m) => [m.oldNamespacedName,
        m.es6ExportName]));
    astTypes.visit(program, {
        visitMemberExpression(path) {
            const memberName = document_util_1.getMemberName(path.node);
            const newLocalName = rewriteMap.get(memberName);
            if (newLocalName) {
                path.replace(jsc.identifier(newLocalName));
                return false;
            }
            this.traverse(path);
            return;
        }
    });
}
exports.rewriteReferencesToLocalExports = rewriteReferencesToLocalExports;
//# sourceMappingURL=rewrite-references-to-local-exports.js.map