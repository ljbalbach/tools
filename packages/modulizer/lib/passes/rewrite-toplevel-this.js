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
/**
 * Replace all "this" identifiers to "window" identifiers. Detects and handles
 * for strict vs. sloppy mode.
 */
function rewriteToplevelThis(program) {
    let isStrictMode = false;
    astTypes.visit(program, {
        // Don't delve into any function or class bodies.
        visitFunctionDeclaration() {
            return false;
        },
        visitFunctionExpression() {
            return false;
        },
        visitClassBody() {
            return false;
        },
        visitLiteral(path) {
            // A sloppy way of detecting if the script is intended to be strict mode.
            if (path.node.value === 'use strict' && path.parent &&
                path.parent.node.type === 'ExpressionStatement' &&
                path.parent.parent && path.parent.parent.node.type === 'Program') {
                isStrictMode = true;
            }
            return false;
        },
        // Sloppy mode code that references `this` at the toplevel is actually
        // talking about `window`. Make that explicit, so it works the same in
        // strict mode.
        visitThisExpression(path) {
            if (!isStrictMode) {
                path.replace({ type: 'Identifier', name: 'window' });
            }
            return false;
        }
    });
}
exports.rewriteToplevelThis = rewriteToplevelThis;
//# sourceMappingURL=rewrite-toplevel-this.js.map