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
// Install source map support for stack traces, etc.
require('source-map-support').install();
const path = require("path");
const child_process_1 = require("mz/child_process");
const fs = require("fs-extra");
const commandLineArgs = require("command-line-args");
const run_fixture_1 = require("../test/fixtures/run-fixture");
const cliDefs = [
    {
        name: 'skip-source-update',
        type: Boolean,
        defaultValue: false,
        description: `Whether to skip updating the source repo, ` +
            `so that the expected result is generated from the existing source.`,
    },
];
function updateFixture(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const fixturesDir = path.resolve(__dirname, '../../fixtures/packages/', options.folder);
        const sourceDir = path.join(fixturesDir, 'source');
        const convertedDir = path.join(fixturesDir, 'expected');
        if (!options.skipSourceUpdate) {
            const branch = options.branch || 'master';
            console.log(`Cloning ${options.repoUrl} #${branch} to ${sourceDir}...`);
            yield fs.ensureDir(fixturesDir);
            yield fs.remove(sourceDir);
            yield child_process_1.exec(`git clone ${options.repoUrl} ${sourceDir} --branch=${branch} --depth=1`, { cwd: fixturesDir });
            yield fs.remove(path.join(sourceDir, '.git'));
            yield fs.remove(path.join(sourceDir, '.github'));
            yield fs.remove(path.join(sourceDir, '.gitignore'));
            yield overridePolymer(sourceDir);
            yield child_process_1.exec('bower install', { cwd: sourceDir });
        }
        const testConfig = require(path.join(fixturesDir, 'test.js'));
        yield run_fixture_1.runFixture(sourceDir, convertedDir, testConfig);
        // Our integration tests always skip bower_components when comparing, so
        // there's no reason to check them into git.
        yield fs.remove(path.join(convertedDir, 'bower_components'));
        console.log(`Done.`);
    });
}
/**
 * Overrides the polymer dependency to Polymer/polymer#master and adds a
 * resolution to bower.json.
 */
function overridePolymer(sourceDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const bowerJsonFilename = path.join(sourceDir, 'bower.json');
        const bowerJson = JSON.parse(yield fs.readFile(bowerJsonFilename, 'utf-8'));
        if (bowerJson.name !== 'polymer') {
            bowerJson.dependencies = bowerJson.dependencies || {};
            bowerJson.dependencies.polymer = 'Polymer/polymer#master';
            bowerJson.resolutions = bowerJson.resolutions || {};
            bowerJson.resolutions.polymer = 'master';
            yield fs.writeFile(bowerJsonFilename, JSON.stringify(bowerJson, null, 2), 'utf-8');
        }
    });
}
(() => __awaiter(this, void 0, void 0, function* () {
    const options = commandLineArgs(cliDefs);
    const skipSourceUpdate = options['skip-source-update'];
    let exitCode = 0;
    yield Promise.all([
        updateFixture({
            folder: 'polymer',
            branch: '2.x',
            repoUrl: 'https://github.com/Polymer/polymer.git',
            skipSourceUpdate,
        }),
        updateFixture({
            folder: 'paper-button',
            branch: '2.x',
            repoUrl: 'https://github.com/PolymerElements/paper-button.git',
            skipSourceUpdate,
        }),
        updateFixture({
            folder: 'iron-icon',
            branch: '2.x',
            repoUrl: 'https://github.com/PolymerElements/iron-icon.git',
            skipSourceUpdate,
        }),
    ].map((p) => p.catch((e) => {
        // Exit with an error code if any fixture fails, but let them all finish.
        console.error(e);
        exitCode = 1;
    })));
    process.exit(exitCode);
}))();
//# sourceMappingURL=update-fixtures.js.map