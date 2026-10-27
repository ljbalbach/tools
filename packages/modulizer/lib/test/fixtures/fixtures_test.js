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
const chalk_1 = require("chalk");
const diff = require("diff");
const fs = require("fs-extra");
const os_1 = require("os");
const path = require("path");
const run_fixture_1 = require("./run-fixture");
// TODO(fks): Add 'dir-compare' typings.
const dircompare = require('dir-compare');
// Install source map support for stack traces, etc.
require('source-map-support').install();
const packageFixturesDir = path.resolve(__dirname, '../../../fixtures/packages');
/**
 * Pretty-format a full diff patch for console reporting.
 */
function formatDiffPatch(patch) {
    return patch.split(os_1.EOL)
        .slice(4)
        .map(formatDiffLine)
        .filter(Boolean)
        .join(os_1.EOL);
}
/**
 * Pretty-format a single line from a diff patch for console reporting.
 */
function formatDiffLine(line) {
    if (!line) {
        return null;
    }
    switch (line[0]) {
        case '@':
            return null;
        case '\\':
            return null;
        case '+':
            return '  ' + chalk_1.default.green(line);
        case '-':
            return '  ' + chalk_1.default.red(line);
        case ' ':
            return '  ' + line;
        default:
            return '  ' + line;
    }
}
/**
 * Create a human-readable, pretty-printed report for the diff results of two
 * directories.
 */
function createDiffConflictOutput(diffResult) {
    const errorOutputLines = ['Converted fixture does not match expected:', ''];
    diffResult.diffSet.forEach(function (entry) {
        switch (entry.state) {
            case 'equal':
                return;
            case 'left':
                const expectedFileRelPath = path.join(entry.relativePath || '/', entry.name1);
                errorOutputLines.push((chalk_1.default.bold.green(' + ' + expectedFileRelPath)));
                return;
            case 'right':
                const actualFileRelPath = path.join(entry.relativePath || '/', entry.name2);
                errorOutputLines.push((chalk_1.default.bold.red(' - ' + actualFileRelPath)));
                return;
            case 'distinct':
                const diffedFileRelPath = path.join(entry.relativePath || '/', entry.name1);
                const expectedFilePath = path.join(entry.path1, entry.name1);
                const actualFilePath = path.join(entry.path2, entry.name2);
                const patch = diff.createPatch('string', fs.readFileSync(expectedFilePath, 'utf8'), fs.readFileSync(actualFilePath, 'utf8'), 'expected', 'converted');
                errorOutputLines.push((chalk_1.default.bold.red('<> ' + diffedFileRelPath)));
                errorOutputLines.push(formatDiffPatch(patch));
                return;
            default:
                throw new Error('Unexpected diff-entry format: ' + entry);
        }
    });
    return errorOutputLines.concat(['']).join(os_1.EOL);
}
suite('Fixtures', () => {
    suite('Packages', function () {
        this.timeout(120 * 1000);
        for (const fixtureBasename of fs.readdirSync(packageFixturesDir)) {
            const fixtureDir = path.join(packageFixturesDir, fixtureBasename);
            if (!fs.statSync(fixtureDir).isDirectory()) {
                continue;
            }
            test(`packages/${fixtureBasename}`, () => __awaiter(this, void 0, void 0, function* () {
                const fixtureSourceDir = path.join(fixtureDir, 'source');
                const fixtureExpectedDir = path.join(fixtureDir, 'expected');
                const fixtureResultDir = path.join(fixtureDir, 'generated');
                const fixtureTestConfig = require(path.join(fixtureDir, 'test.js'));
                chai_1.assert.isOk(fs.statSync(fixtureSourceDir).isDirectory());
                chai_1.assert.isOk(fs.statSync(fixtureExpectedDir).isDirectory());
                const output = yield run_fixture_1.runFixture(fixtureSourceDir, fixtureResultDir, fixtureTestConfig);
                // 1. Check stderr output that no (unexpected) errors were emitted.
                chai_1.assert.equal(output.stderr, (fixtureTestConfig.stderr || ''));
                // 2. Compare the generated output to the expected conversion.
                //    Output the diff & fail if any differences are encountered.
                const diffResult = dircompare.compareSync(fixtureResultDir, fixtureExpectedDir, {
                    compareSize: true,
                    compareContent: true,
                    excludeFilter: 'bower_components',
                });
                if (!diffResult.same) {
                    const diffOutput = createDiffConflictOutput(diffResult);
                    throw new Error(diffOutput);
                }
                // 1. Check stdout output that no (unexpected) output was emitted.
                chai_1.assert.equal(output.stdout, (fixtureTestConfig.stdout || ''));
            }));
        }
    });
});
//# sourceMappingURL=fixtures_test.js.map