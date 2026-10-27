"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const os_1 = require("os");
const nodeModulesLine = 'node_modules';
const searchNodeModulesLine = new RegExp(`^/?${nodeModulesLine}`);
function ignoreNodeModules(ignoreFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let ignoreLines = [];
        if (yield fse.pathExists(ignoreFile)) {
            const content = yield fse.readFile(ignoreFile, 'utf-8');
            ignoreLines = content.split(os_1.EOL);
        }
        const hasNodeModules = ignoreLines.some((line) => {
            return searchNodeModulesLine.test(line);
        });
        if (hasNodeModules) {
            return;
        }
        ignoreLines.push(nodeModulesLine);
        const outContent = ignoreLines.join(os_1.EOL) + os_1.EOL;
        yield fse.writeFile(ignoreFile, outContent);
    });
}
exports.ignoreNodeModules = ignoreNodeModules;
//# sourceMappingURL=gitignore.js.map