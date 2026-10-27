"use strict";
/**
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
const vscode_languageserver_1 = require("vscode-languageserver");
exports.standardJavaScriptSnippets = [{
        label: `custom-element`,
        documentation: 'Snippet for definition of a custom-element.',
        insertText: `class $1 extends HTMLElement {
  constructor() {
    super();
    $0
  }
}
customElements.define('$2', $1)`,
        insertTextFormat: vscode_languageserver_1.InsertTextFormat.Snippet,
        kind: vscode_languageserver_1.CompletionItemKind.Class,
        filterText: 'customelement',
    }];
exports.default = exports.standardJavaScriptSnippets;
//# sourceMappingURL=standard-snippets.js.map