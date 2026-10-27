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
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const polymer_workspaces_1 = require("polymer-workspaces");
const convert_workspace_1 = require("../convert-workspace");
const package_manifest_1 = require("../package-manifest");
const publish_workspace_1 = require("../publish-workspace");
const push_workspace_1 = require("../push-workspace");
const test_workspace_1 = require("../test-workspace");
const util_1 = require("../util");
const util_2 = require("./util");
const githubTokenMessage = `
You need to create a github token and place it in a file named 'github-token'.
The token does not need any permissions.

Generate a token here:   https://github.com/settings/tokens

Then:

echo 'PASTE TOKEN HEX HERE' > ./github-token
`;
/**
 * Post-Conversion steps that the user can select to run after workspace
 * conversion.
 */
var PostConversionStep;
(function (PostConversionStep) {
    PostConversionStep["Test"] = "Install dependencies and run tests";
    PostConversionStep["TestInstallOnly"] = "Install dependencies only";
    PostConversionStep["Push"] = "Push changes to GitHub";
    PostConversionStep["Publish"] = "Publish changes to npm";
    PostConversionStep["Exit"] = "Exit";
})(PostConversionStep || (PostConversionStep = {}));
/**
 * Create an array of post-conversion steps to run automatically from the given
 * CLI options. For example, when `--test` is provided the "test"
 * post-conversion step should be run without prompting.
 *
 * Steps should be run in the order returned.
 */
function postConversionStepsFromCliOptions(options) {
    const steps = [];
    if (options.install === true) {
        steps.push(PostConversionStep.TestInstallOnly);
    }
    if (options.test === true) {
        steps.push(PostConversionStep.Test);
    }
    if (options.push === true) {
        steps.push(PostConversionStep.Push);
    }
    if (options.publish === true) {
        steps.push(PostConversionStep.Publish);
    }
    return steps;
}
/**
 * Checks for github-token in the RunnerOptions and if not specified, will look
 * in the github-token file in working folder.  If that doesn't exist either,
 * we message to the user that we need a token and exit the process.
 */
function loadGitHubToken() {
    // TODO(usergenic): Maybe support GITHUB_TOKEN as an environment variable,
    // since this would be a better solution for Travis deployments etc.
    const githubFilename = 'github-token';
    if (!fs.existsSync(githubFilename)) {
        console.error(`Missing file "${githubFilename}"`);
        return null;
    }
    try {
        return fs.readFileSync(githubFilename, 'utf8').trim();
    }
    catch (e) {
        console.error(`Unable to load file ${githubFilename}: ${e.message}`);
    }
    return null;
}
function run(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceDir = path.resolve(options['workspace-dir']);
        util_1.logStep(1, 3, '🚧', `Setting Up Workspace "${workspaceDir}"...`);
        for (const rawMapping of options['dependency-mapping']) {
            try {
                const [bowerName, npmName, npmSemver] = util_2.parseDependencyMappingInput(rawMapping);
                package_manifest_1.saveDependencyMapping(bowerName, npmName, npmSemver);
            }
            catch (err) {
                console.error(err.message);
                process.exit(1);
            }
        }
        if (!options['npm-version']) {
            throw new Error('--npm-version required');
        }
        const npmPackageVersion = options['npm-version'];
        const githubToken = options['github-token'] || loadGitHubToken();
        if (!githubToken) {
            console.log(githubTokenMessage);
            return;
        }
        const workspace = new polymer_workspaces_1.Workspace({
            token: githubToken,
            dir: workspaceDir,
            match: options['repo'],
            exclude: options['exclude'],
            fresh: options['clean'],
            verbose: true,
        });
        const { workspaceRepos: reposToConvert } = yield workspace.init();
        yield workspace.installBowerDependencies();
        util_1.logStep(2, 3, '🌀', `Converting ${reposToConvert.length} Package(s)...`);
        const convertedPackages = yield convert_workspace_1.default({
            workspaceDir,
            npmImportStyle: options['import-style'],
            packageVersion: npmPackageVersion,
            reposToConvert,
            deleteFiles: options['delete-files'],
            flat: options.flat,
            private: options.private,
            addImportMeta: options['add-import-meta'],
            excludes: options.exclude,
        });
        util_1.logStep(3, 3, '🎉', `Conversion Complete!`);
        // Loop indefinitely here so that we can control the function exit via the
        // user prompt.
        const todoConversionSteps = postConversionStepsFromCliOptions(options);
        while (true) {
            // Pull off a "to-do" post-conversion step if any were provided from the
            // command line, otherwise prompt the user for one.
            const stepSelection = todoConversionSteps.shift() ||
                (yield inquirer.prompt([{
                        type: 'list',
                        name: 'post-conversion-step',
                        message: 'What do you want to do now?',
                        choices: Object.values(PostConversionStep),
                    }]))['post-conversion-step'];
            switch (stepSelection) {
                case PostConversionStep.Test:
                    yield test_workspace_1.testWorkspace(convertedPackages, {
                        workspaceDir,
                        packageVersion: npmPackageVersion,
                        reposToConvert,
                        flat: options.flat,
                        private: options.private,
                        importStyle: options['import-style'],
                    });
                    break;
                case PostConversionStep.TestInstallOnly:
                    yield test_workspace_1.testWorkspaceInstallOnly(convertedPackages, {
                        workspaceDir,
                        packageVersion: npmPackageVersion,
                        reposToConvert,
                        flat: options.flat,
                        private: options.private,
                        importStyle: options['import-style'],
                    });
                    break;
                case PostConversionStep.Push:
                    yield push_workspace_1.default(reposToConvert);
                    break;
                case PostConversionStep.Publish:
                    yield publish_workspace_1.default(reposToConvert);
                    break;
                case PostConversionStep.Exit:
                    console.log('👋  Goodbye.');
                    return;
                default:
                    console.log(`ERR: option "${stepSelection}" not recognized`);
                    break;
            }
        }
    });
}
exports.default = run;
//# sourceMappingURL=command-workspace.js.map