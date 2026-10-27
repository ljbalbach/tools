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
const ruleId = 'iron-flex-layout-import';
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
    test('warns when deprecated files are used with the right messages', () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([`${ruleId}/deprecated-files-before-fixes.html`]);
        chai_1.assert.deepEqual(warningPrinter.prettyPrint(warnings), [
            `
<link rel="import" href="./iron-flex-layout/classes/iron-flex-layout.html">
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
<link rel="import" href="./iron-flex-layout/classes/iron-shadow-flex-layout.html">
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
        ]);
        chai_1.assert.deepEqual(warnings.map((w) => w.message), [
            `./iron-flex-layout/classes/iron-flex-layout.html import is deprecated in iron-flex-layout v1, and not shipped in iron-flex-layout v2.
Replace it with ./iron-flex-layout/iron-flex-layout-classes.html import.
Run the lint rule \`iron-flex-layout-classes\` with \`--fix\` to include the required style modules.`,
            `./iron-flex-layout/classes/iron-shadow-flex-layout.html import is deprecated in iron-flex-layout v1, and not shipped in iron-flex-layout v2.
Replace it with ./iron-flex-layout/iron-flex-layout-classes.html import.
Run the lint rule \`iron-flex-layout-classes\` with \`--fix\` to include the required style modules.`,
        ]);
    }));
    let testName = 'applies automatic-safe fixes when deprecated files are used';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        yield util_1.assertExpectedFixes(linter, analyzer, `${ruleId}/deprecated-files-before-fixes.html`, `${ruleId}/deprecated-files-after-fixes.html`);
    }));
    testName = 'warns when iron-flex-layout modules are used but not imported';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([`${ruleId}/forgot-import-before-fixes.html`]);
        chai_1.assert.deepEqual(warningPrinter.prettyPrint(warnings), [
            `
    <style include="iron-flex"></style>
                   ~~~~~~~~~~~`,
        ]);
        chai_1.assert.deepEqual(warnings.map((w) => w.message), [
            `iron-flex-layout style modules are used but not imported.
Import iron-flex-layout/iron-flex-layout-classes.html`,
        ]);
    }));
    test('adds missing import by inferring the base path', () => __awaiter(this, void 0, void 0, function* () {
        yield util_1.assertExpectedFixes(linter, analyzer, `${ruleId}/forgot-import-before-fixes.html`, `${ruleId}/forgot-import-after-fixes.html`);
    }));
    test('adds missing import by defaulting the base path', () => __awaiter(this, void 0, void 0, function* () {
        yield util_1.assertExpectedFixes(linter, analyzer, `${ruleId}/forgot-import-no-imports-before-fixes.html`, `${ruleId}/forgot-import-no-imports-after-fixes.html`);
    }));
    test('warns when iron-flex-layout modules are imported but not used', () => __awaiter(this, void 0, void 0, function* () {
        const { warnings } = yield linter.lint([`${ruleId}/unnecessary-import-before-fixes.html`]);
        chai_1.assert.deepEqual(warningPrinter.prettyPrint(warnings), [
            `
<link rel="import" href="iron-flex-layout/iron-flex-layout-classes.html">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
        ]);
        chai_1.assert.deepEqual(warnings.map((w) => w.message), [
            `This import defines style modules that are not being used. It can be removed.`,
        ]);
    }));
    test('removes unnecessary import', () => __awaiter(this, void 0, void 0, function* () {
        yield util_1.assertExpectedFixes(linter, analyzer, `${ruleId}/unnecessary-import-before-fixes.html`, `${ruleId}/unnecessary-import-after-fixes.html`);
    }));
});
//# sourceMappingURL=iron-flex-layout-import_test.js.map