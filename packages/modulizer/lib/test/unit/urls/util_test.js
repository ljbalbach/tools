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
const chai_1 = require("chai");
const util_1 = require("../../../urls/util");
suite('src/url-handler', () => {
    suite('getRelativeUrl()', () => {
        test('handles two root urls relative to the same directory', () => {
            chai_1.assert.equal(util_1.getRelativeUrl('./foo.js', './bar.js'), './bar.js');
            chai_1.assert.equal(util_1.getRelativeUrl('./foo/foo.js', './bar.js'), '../bar.js');
            chai_1.assert.equal(util_1.getRelativeUrl('./foo/foo.js', './bar/bar.js'), '../bar/bar.js');
        });
        test('explicitly does not handle sibling/parent urls', () => {
            chai_1.assert.throws(() => {
                util_1.getRelativeUrl('../foo.js', './bar.js');
            }, `paths relative to package root expected (actual: from="../foo.js", to="./bar.js")`);
        });
    });
});
//# sourceMappingURL=util_test.js.map