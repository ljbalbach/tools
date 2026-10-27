"use strict";
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
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
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const gen_ts_1 = require("../gen-ts");
const fixtures = path.join(__dirname, '..', '..', 'src', 'test', 'fixtures');
const goldens = path.join(__dirname, '..', '..', 'src', 'test', 'goldens_goog');
suite('generateDeclarations (goog)', () => {
    for (const fixture of fs.readdirSync(goldens)) {
        test(fixture, () => __awaiter(this, void 0, void 0, function* () {
            let config = {};
            const configPath = path.join(fixtures, fixture, 'gen-tsd.json');
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            config.googModules = true;
            config.hideWarnings = true;
            const actual = yield gen_ts_1.generateDeclarations(path.join(fixtures, fixture), config);
            const golden = readDirAsMap(path.join(goldens, fixture));
            chai_1.assert.hasAllKeys(actual, [...golden.keys()]);
            for (const filename of actual.keys()) {
                chai_1.assert.equal(actual.get(filename), golden.get(filename), filename);
            }
        })).timeout(30000); // These tests can take a long time.
    }
});
function readDirAsMap(dir) {
    const files = new Map();
    for (const filename of glob.sync('**', { cwd: dir, nodir: true })) {
        files.set(filename, fs.readFileSync(path.join(dir, filename)).toString());
    }
    return files;
}
//# sourceMappingURL=gen-ts_goog_test.js.map