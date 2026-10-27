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
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const polymer_project_config_1 = require("polymer-project-config");
const linter_1 = require("../linter");
const rule_1 = require("../rule");
const util_1 = require("./util");
const fixtures_dir = path.resolve(path.join(__dirname, '../../test'));
class AlwaysWarnsRule extends rule_1.Rule {
    constructor() {
        super(...arguments);
        this.code = 'always-warn-rule';
        this.description = 'Always warns, for every file';
    }
    check(document) {
        return __awaiter(this, void 0, void 0, function* () {
            return [new polymer_analyzer_1.Warning({
                    parsedDocument: document.parsedDocument,
                    code: this.code,
                    message: this.description,
                    severity: polymer_analyzer_1.Severity.WARNING,
                    sourceRange: {
                        file: document.url,
                        start: { line: 0, column: 0 },
                        end: { line: 0, column: 0 }
                    }
                })];
        });
    }
}
suite('Linter', () => {
    suite('.lint', () => {
        let analyzer;
        let warningPrinter;
        setup(() => __awaiter(this, void 0, void 0, function* () {
            ({ analyzer } =
                yield polymer_project_config_1.ProjectConfig.initializeAnalyzerFromDirectory(fixtures_dir));
            warningPrinter = new util_1.WarningPrettyPrinter();
        }));
        test('works in the trivial case', () => __awaiter(this, void 0, void 0, function* () {
            const linter = new linter_1.Linter([], analyzer);
            const { warnings } = yield linter.lint([]);
            chai_1.assert.deepEqual([...warnings], []);
        }));
        test('gives no warnings for a perfectly fine file', () => __awaiter(this, void 0, void 0, function* () {
            const linter = new linter_1.Linter([], analyzer);
            const { warnings } = yield linter.lint(['perfectly-fine/polymer-element.html']);
            chai_1.assert.deepEqual([...warnings], []);
        }));
        test('surfaces warnings up from the analyzer', () => __awaiter(this, void 0, void 0, function* () {
            // Even without any rules we still get the warnings from the analyzer.
            const linter = new linter_1.Linter([], analyzer);
            const { warnings } = yield linter.lint(['missing-imports/missing-imports.html']);
            chai_1.assert.deepEqual(warningPrinter.prettyPrint(warnings), [
                `
<link rel="import" href="./does-not-exist.html">
                        ~~~~~~~~~~~~~~~~~~~~~~~`,
                `
<link rel="import" href="./also-does-not-exist.html">
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
            ]);
        }));
        const testName = 'when linting a package, do not surface warnings from external files';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const dir = path.join(fixtures_dir, 'package-external');
            const { analyzer } = yield polymer_project_config_1.ProjectConfig.initializeAnalyzerFromDirectory(dir);
            const linter = new linter_1.Linter([new AlwaysWarnsRule()], analyzer);
            const { warnings } = yield linter.lintPackage();
            // One warning from the analyzer, one from the AlwaysWarns, both in
            // index, none from bower_components/external.html
            chai_1.assert.deepEqual(warnings.map((w) => w.sourceRange.file), ['index.html', 'index.html'].map((u) => analyzer.resolveUrl(u)));
            const { warnings: alsoWarnings } = yield linter.lint(['index.html']);
            chai_1.assert.deepEqual(alsoWarnings, warnings);
            const { warnings: allWarnings } = yield linter.lint(['index.html', 'bower_components/external.html']);
            chai_1.assert.deepEqual(allWarnings.map((w) => w.sourceRange.file).sort(), [
                'index.html',
                'index.html',
                'bower_components/external.html',
                'bower_components/external.html'
            ].map((u) => analyzer.resolveUrl(u)).sort());
        }));
    });
});
//# sourceMappingURL=linter_test.js.map