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
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const polymer_project_config_1 = require("polymer-project-config");
const linter_1 = require("../../linter");
const registry_1 = require("../../registry");
const util_1 = require("../util");
const fixtures_dir = path.join(__dirname, '..', '..', '..', 'test');
const ruleId = 'validate-element-name';
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
    test('gives no warnings for a perfectly fine file', () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint(['perfectly-fine/polymer-element.html']);
        chai_1.assert.deepEqual([...warnings], []);
    }));
    test('warns for the proper cases and with the right messages', () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([`${ruleId}/${ruleId}.html`]);
        chai_1.assert.deepEqual(warningPrinter.prettyPrint(warnings), [
            `
        return 'test-App';
               ~~~~~~~~~~`,
            `
      is: 'app'
          ~~~~~`,
            `
      is: '1-app'
          ~~~~~~~`,
            `
      is: '-app'
          ~~~~~~`,
            `
      is: 'my-app!'
          ~~~~~~~~~`,
            `
      is: 'font-face'
          ~~~~~~~~~~~`,
            `
      is: 'polymer-app'
          ~~~~~~~~~~~~~`,
            `
      is: 'x-app'
          ~~~~~~~`,
            `
      is: 'ng-app'
          ~~~~~~~~`,
            `
      is: 'xml-app'
          ~~~~~~~~~`,
            `
      is: 'my-app-'
          ~~~~~~~~~`,
            `
      is: 'my--app'
          ~~~~~~~~~`,
        ]);
        chai_1.assert.deepEqual(warnings.map(({ message, severity }) => ({ message, severity })), [
            {
                message: 'Custom element names must not contain uppercase ASCII characters.',
                severity: polymer_analyzer_1.Severity.ERROR,
            },
            {
                message: 'Custom element names must contain a hyphen. Example: unicorn-cake',
                severity: polymer_analyzer_1.Severity.ERROR,
            },
            {
                message: 'Custom element names must not start with a digit.',
                severity: polymer_analyzer_1.Severity.ERROR,
            },
            {
                message: 'Custom element names must not start with a hyphen.',
                severity: polymer_analyzer_1.Severity.ERROR,
            },
            {
                message: 'Invalid element name.',
                severity: polymer_analyzer_1.Severity.ERROR,
            },
            {
                message: 'The supplied element name is reserved and can\'t be used.\nSee: https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name',
                severity: polymer_analyzer_1.Severity.ERROR,
            },
            {
                message: 'Custom element names should not start with `polymer-`.\nSee: http://webcomponents.github.io/articles/how-should-i-name-my-element',
                severity: polymer_analyzer_1.Severity.WARNING,
            },
            {
                message: 'Custom element names should not start with `x-`.\nSee: http://webcomponents.github.io/articles/how-should-i-name-my-element/',
                severity: polymer_analyzer_1.Severity.WARNING,
            },
            {
                message: 'Custom element names should not start with `ng-`.\nSee: http://docs.angularjs.org/guide/directive#creating-directives',
                severity: polymer_analyzer_1.Severity.WARNING,
            },
            {
                message: 'Custom element names should not start with `xml`.',
                severity: polymer_analyzer_1.Severity.WARNING,
            },
            {
                message: 'Custom element names should not end with a hyphen.',
                severity: polymer_analyzer_1.Severity.WARNING,
            },
            {
                message: 'Custom element names should not contain consecutive hyphens.',
                severity: polymer_analyzer_1.Severity.WARNING,
            }
        ]);
    }));
});
//# sourceMappingURL=validate-element-name_test.js.map