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
const path_1 = require("path");
const util_1 = require("./util");
suite('Logger', () => {
    test('will log to a file when asked to', () => __awaiter(this, void 0, void 0, function* () {
        const { client, baseDir } = yield util_1.createTestEnvironment();
        const logFile = path_1.join(baseDir, 'pes.log');
        yield client.changeConfiguration({ logToFile: logFile });
        yield util_1.delay(100);
        chai_1.assert.match(fs_1.readFileSync(logFile, 'utf-8'), /^\n\n\n\n\nInitialized with workspace path:/);
        yield client.cleanup();
    }));
});
//# sourceMappingURL=logger_test.js.map