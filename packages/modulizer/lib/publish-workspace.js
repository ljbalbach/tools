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
const chalk_1 = require("chalk");
const inquirer = require("inquirer");
const polymer_workspaces_1 = require("polymer-workspaces");
const util_1 = require("./util");
function run(reposToConvert) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.dim('[1/3] ') + chalk_1.default.magenta(`Setting up publish to npm...`));
        const whoAmI = yield reposToConvert[0].npm.whoami();
        console.log(`npm whoami: ${whoAmI}`);
        const { publishTag } = yield inquirer.prompt([
            {
                type: 'input',
                name: 'publishTag',
                message: 'publish to npm tag:',
                default: 'next',
            },
        ]);
        console.log('');
        console.log('Ready to publish:');
        for (const repo of reposToConvert) {
            const packageInfo = yield repo.npm.getPackageManifest();
            console.log(`  - ${chalk_1.default.cyan(publishTag)}: ${packageInfo.name}${chalk_1.default.dim('@')}${packageInfo.version}`);
        }
        console.log('');
        const { confirmPublish } = (yield inquirer.prompt([{
                type: 'confirm',
                name: 'confirmPublish',
                message: 'start?',
                default: true,
            }]));
        if (!confirmPublish) {
            return;
        }
        console.log(chalk_1.default.dim('[2/3] ') + chalk_1.default.magenta(`Publishing to npm...`));
        const publishResults = yield polymer_workspaces_1.publishPackagesToNpm(reposToConvert, publishTag);
        publishResults.successes.forEach((_result, repo) => {
            console.log(`  - ${chalk_1.default.cyan(repo.dir)}: success!`);
        });
        publishResults.failures.forEach(util_1.logRepoError);
        console.log(chalk_1.default.dim('[3/3]') + ' 🎉  ' + chalk_1.default.magenta(`Publish Complete!`));
    });
}
exports.default = run;
//# sourceMappingURL=publish-workspace.js.map