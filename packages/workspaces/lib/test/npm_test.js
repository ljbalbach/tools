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
const fs_1 = require("fs");
const util_1 = require("util");
const path = require("path");
const _rimraf = require("rimraf");
const npm_1 = require("../npm");
const exec_1 = require("../util/exec");
const rimraf = util_1.promisify(_rimraf);
suite('src/npm', function () {
    this.timeout(20 * 1000);
    suite('NpmPackage', () => {
        const npmDir = path.join(__dirname, 'POLYMER_WORKSPACES_NPM_DIR');
        const emptyDir = path.join(__dirname, 'POLYMER_WORKSPACES_EMPTY_NPM_DIR');
        setup(() => __awaiter(this, void 0, void 0, function* () {
            fs_1.mkdirSync(npmDir);
            fs_1.mkdirSync(emptyDir);
            yield exec_1.default(npmDir, `npm`, [`init`, '--force']);
        }));
        teardown(() => __awaiter(this, void 0, void 0, function* () {
            yield rimraf(npmDir);
            yield rimraf(emptyDir);
        }));
        suite.skip('npmPackage.whoami()', () => {
            // TODO(fks) 10-12-2017: Add tests. Tests skipped due to the
            // complexity of the underlying npm command.
        });
        suite('gitRepo.getPackageManifest()', () => {
            test('returns the parsed package.json for the package', () => __awaiter(this, void 0, void 0, function* () {
                const npmPackage = new npm_1.NpmPackage(npmDir);
                const packageManifest = yield npmPackage.getPackageManifest();
                chai_1.assert.equal(packageManifest.name, 'POLYMER_WORKSPACES_NPM_DIR');
                chai_1.assert.equal(packageManifest.version, '1.0.0');
            }));
            test('throws a ENOENT error if no package.json file exists', () => __awaiter(this, void 0, void 0, function* () {
                const emptyNpmPackage = new npm_1.NpmPackage(emptyDir);
                let packageManifest, packageManifestError;
                try {
                    packageManifest = yield emptyNpmPackage.getPackageManifest();
                }
                catch (err) {
                    packageManifestError = err;
                }
                finally {
                    chai_1.assert.isUndefined(packageManifest);
                    chai_1.assert.instanceOf(packageManifestError, Error);
                    chai_1.assert.equal(packageManifestError.code, 'ENOENT');
                }
            }));
        });
        suite.skip('gitRepo.publishToNpm()', () => {
            // TODO(fks) 10-12-2017: Add tests. Tests skipped due to the
            // complexity of the underlying npm command.
        });
    });
});
//# sourceMappingURL=npm_test.js.map