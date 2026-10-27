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
const polymer_analyzer_1 = require("polymer-analyzer");
class WarningPrettyPrinter {
    prettyPrint(warnings) {
        return warnings.map((w) => '\n' + w.toString({ verbosity: 'code-only', color: false }));
    }
}
exports.WarningPrettyPrinter = WarningPrettyPrinter;
/**
 * Assert that applying all fixes to the given input file results in
 * the given golden output file.
 */
function assertExpectedFixes(linter, analyzer, inputFile, goldenFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([inputFile]);
        const edits = warnings.filter((w) => w.fix).map((w) => w.fix);
        const loader = polymer_analyzer_1.makeParseLoader(analyzer);
        const { editedFiles, incompatibleEdits } = yield polymer_analyzer_1.applyEdits(edits, loader);
        chai_1.assert.deepEqual(incompatibleEdits, []);
        const inputFileContent = editedFiles.get(analyzer.resolveUrl(inputFile));
        const outputFileContent = (yield loader(analyzer.resolveUrl(goldenFile))).contents;
        chai_1.assert.deepEqual(inputFileContent, outputFileContent);
    });
}
exports.assertExpectedFixes = assertExpectedFixes;
/**
 * Assert that applying the given edit result modifies the given input file
 * and results in the contents of the given golden output file.
 *
 * Like assertExpectedFixes, but can also test edit actions.
 */
function assertFileEdited(analyzer, editResult, inputFile, goldenFile) {
    return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.deepEqual(editResult.editedFiles.get(analyzer.resolveUrl(inputFile)), (yield analyzer.load(analyzer.resolveUrl(goldenFile))));
    });
}
exports.assertFileEdited = assertFileEdited;
//# sourceMappingURL=util.js.map