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
const exec_1 = require("./util/exec");
const fs = require("fs");
const path = require("path");
const _util = require("util");
const { promisify } = _util;
class NpmPackage {
    constructor(dir) {
        this.dir = dir;
    }
    /**
     * Return the current user logged in to npm.
     */
    whoami() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield exec_1.default(this.dir, 'npm', ['whoami'])).stdout;
        });
    }
    /**
     * Return the current package manifest. Throws if there are any issues
     * reading/parsing the file contents.
     */
    getPackageManifest() {
        return __awaiter(this, void 0, void 0, function* () {
            const packageManifestLoc = path.join(this.dir, 'package.json');
            const packageManifest = yield promisify(fs.readFile)(packageManifestLoc, 'utf-8');
            return JSON.parse(packageManifest);
        });
    }
    /**
     * Run `npm publish` in the package directory. A tag name is required
     * (use "latest" to mimic the npm default).
     */
    publishToNpm(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            return exec_1.default(this.dir, 'npm', ['publish', '--tag', tagName]);
        });
    }
}
exports.NpmPackage = NpmPackage;
//# sourceMappingURL=npm.js.map