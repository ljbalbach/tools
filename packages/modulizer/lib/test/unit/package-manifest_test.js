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
const chai_1 = require("chai");
const package_manifest_1 = require("../../package-manifest");
const util_1 = require("./util");
suite('src/package-manifest', () => {
    suite('lookupDependencyMapping()', () => {
        test('returns undefined when dependency map is not known', () => __awaiter(this, void 0, void 0, function* () {
            const output = yield util_1.interceptOutput(() => __awaiter(this, void 0, void 0, function* () {
                const result = package_manifest_1.lookupDependencyMapping('UNKNOWN_PACKAGE_NAME');
                chai_1.assert.isUndefined(result);
            }));
            chai_1.assert.deepEqual(output.trim(), `WARN: bower->npm mapping for "UNKNOWN_PACKAGE_NAME" not found`);
        }));
        test('returns dependency mapping info when dependency map is known', () => {
            const result = package_manifest_1.lookupDependencyMapping('polymer');
            chai_1.assert.deepEqual(result, {
                npm: '@polymer/polymer',
                semver: '^3.0.0',
            });
        });
    });
    suite('saveDependencyMapping()', () => {
        const testName = `saves a dependency mapping for later lookup ` +
            `via lookupDependencyMapping()`;
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const output = yield util_1.interceptOutput(() => __awaiter(this, void 0, void 0, function* () {
                const bowerName = 'CUSTOM_BOWER_PACKAGE_NAME';
                const customMappingInfo = {
                    npm: 'CUSTOM_NPM_PACKAGE_NAME',
                    semver: '^1.2.3'
                };
                let result = package_manifest_1.lookupDependencyMapping(bowerName);
                chai_1.assert.isUndefined(result);
                package_manifest_1.saveDependencyMapping(bowerName, customMappingInfo.npm, customMappingInfo.semver);
                result = package_manifest_1.lookupDependencyMapping(bowerName);
                chai_1.assert.deepEqual(result, customMappingInfo);
            }));
            chai_1.assert.deepEqual(output.trim(), `WARN: bower->npm mapping for "CUSTOM_BOWER_PACKAGE_NAME" not found`);
        }));
    });
});
//# sourceMappingURL=package-manifest_test.js.map