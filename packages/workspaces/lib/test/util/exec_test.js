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
const exec_1 = require("../../util/exec");
suite('src/util/exec', () => {
    suite('exec()', () => {
        test('returns false if current directory does not exist', () => __awaiter(this, void 0, void 0, function* () {
            const testCwd = process.cwd();
            const result = yield exec_1.default(testCwd, 'pwd');
            chai_1.assert.deepEqual(result, { stdout: testCwd, stderr: '' });
        }));
        test('passes arguments correctly', () => __awaiter(this, void 0, void 0, function* () {
            const testOutput = 'HELLO THERE';
            const result = yield exec_1.default('', 'echo', [testOutput]);
            chai_1.assert.deepEqual(result, { stdout: testOutput, stderr: '' });
        }));
    });
    suite('checkCommand()', () => {
        test('returns true if command exists in shell path', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isTrue(yield exec_1.checkCommand('node')); // must be true to be running this test
        }));
        test('returns false if command does not exist in shell path', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isFalse(yield exec_1.checkCommand('there-is-no-way-this-exists-ia23t4niaq23n'));
        }));
    });
});
//# sourceMappingURL=exec_test.js.map