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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const path = require("path");
const fsUtil = require("../../util/fs");
const knownDirectoryPath = __dirname;
const knownFilePath = __filename;
const knownDoesNotExistPath = path.join(__dirname, 'AI92J53002GKGNFIAWNF');
suite('src/util/fs', () => {
    suite('existsSync()', () => {
        test('returns true if something exists at path', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isTrue(fsUtil.existsSync(knownDirectoryPath));
            chai_1.assert.isTrue(fsUtil.existsSync(knownFilePath));
        }));
        test('returns false if directory does not exist', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isFalse(fsUtil.existsSync(knownDoesNotExistPath));
        }));
    });
    suite('isDirSync()', () => {
        test('returns true if path is a directory', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isTrue(fsUtil.isDirSync(knownDirectoryPath));
        }));
        test('returns false if path is a file', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isFalse(fsUtil.isDirSync(knownFilePath));
        }));
        test('returns false if nothing exists at path', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isFalse(fsUtil.isDirSync(knownDoesNotExistPath));
        }));
    });
});
//# sourceMappingURL=fs_test.js.map