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
const polymer_project_config_1 = require("polymer-project-config");
const linter_1 = require("../../linter");
const registry_1 = require("../../registry");
const util_1 = require("../util");
const fixtures_dir = path.join(__dirname, '..', '..', '..', 'test');
const ruleId = 'content-to-slot-usages';
suite(ruleId, () => {
    let analyzer;
    let warningPrinter;
    let linter;
    setup(() => __awaiter(this, void 0, void 0, function* () {
        ({ analyzer } =
            yield polymer_project_config_1.ProjectConfig.initializeAnalyzerFromDirectory(fixtures_dir));
        warningPrinter = new util_1.WarningPrettyPrinter();
        linter = new linter_1.Linter(registry_1.registry.getRules([ruleId]), analyzer);
    }));
    test('works in the trivial case', () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([]);
        chai_1.assert.deepEqual([...warnings], []);
    }));
    test('warns for the proper cases and with the right messages', () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([`${ruleId}/${ruleId}.html`]);
        chai_1.assert.deepEqual(warningPrinter.prettyPrint(warnings), [
            `
    <slot name="foo" old-content-selector="!)@#(*(@!#*"></slot>
                                          ~~~~~~~~~~~~~`,
            `
    <slot name="bar" old-content-selector=".bar .baz"></slot>
                                          ~~~~~~~~~~~`,
            `
    <slot name="bar" old-content-selector=".bar > .baz"></slot>
                                          ~~~~~~~~~~~~~`
        ]);
        chai_1.assert.deepEqual(warnings.map((w) => w.message), [
            'Unmatched selector: !)@#(*(@!#*',
            'Unsupported CSS operator: descendant',
            'Unsupported CSS operator: child'
        ]);
    }));
    test('applies automatic-safe fixes', () => __awaiter(this, void 0, void 0, function* () {
        yield util_1.assertExpectedFixes(linter, analyzer, `${ruleId}/before-fixes.html`, `${ruleId}/after-fixes.html`);
    }));
});
//# sourceMappingURL=content-to-slot-usages_test.js.map