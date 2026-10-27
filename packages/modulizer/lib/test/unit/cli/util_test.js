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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const util_1 = require("../../../cli/util");
suite('src/cli/util', () => {
    suite('parseDependencyMappingInput()', () => {
        test('throws an error when more than 3 comma-seperated values are passed', () => {
            chai_1.assert.throws(() => util_1.parseDependencyMappingInput(''));
            chai_1.assert.throws(() => util_1.parseDependencyMappingInput('bad-input'));
            chai_1.assert.throws(() => util_1.parseDependencyMappingInput('bad,bad'));
            chai_1.assert.throws(() => util_1.parseDependencyMappingInput('bad,bad,bad,bad'));
        });
        test('properly parses three comma-seperated values', () => {
            chai_1.assert.deepEqual(util_1.parseDependencyMappingInput('a,b,c'), ['a', 'b', 'c']);
            chai_1.assert.deepEqual(util_1.parseDependencyMappingInput('a-a,b-b,^c.c.c'), ['a-a', 'b-b', '^c.c.c']);
            chai_1.assert.deepEqual(util_1.parseDependencyMappingInput('a.js,b.js,~c.c.c'), ['a.js', 'b.js', '~c.c.c']);
            chai_1.assert.deepEqual(util_1.parseDependencyMappingInput('hello-I-am-some_long_weirdPACKAGEname,hello-I-am-some_long_weirdPACKAGEname,^0.0.0-pre.11'), [
                'hello-I-am-some_long_weirdPACKAGEname',
                'hello-I-am-some_long_weirdPACKAGEname',
                '^0.0.0-pre.11'
            ]);
        });
    });
});
//# sourceMappingURL=util_test.js.map