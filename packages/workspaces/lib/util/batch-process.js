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
const bottleneck_1 = require("bottleneck");
/** Concurrency presets based on some basic benchmarking & common-sense. */
exports.npmPublishConcurrencyPreset = 6;
exports.fsConcurrencyPreset = 6;
exports.githubConcurrencyPreset = 16;
/**
 * Run some function of work over each item in an array (where the function is
 * called with each item as an argument). Group the results by successes an
 * failures based on whether an exception was thrown by that function.
 */
function batchProcess(items, fn, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const concurrency = (options && options.concurrency) || 0;
        const rateLimitter = new bottleneck_1.default(concurrency);
        const successRuns = new Map();
        const failRuns = new Map();
        yield Promise.all(items.map((item) => {
            return rateLimitter.schedule(fn, item).then((result) => {
                successRuns.set(item, result);
            }, (err) => {
                failRuns.set(item, err);
            });
        }));
        return { successes: successRuns, failures: failRuns };
    });
}
exports.batchProcess = batchProcess;
//# sourceMappingURL=batch-process.js.map