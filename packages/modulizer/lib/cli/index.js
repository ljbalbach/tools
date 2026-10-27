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
const commandLineArgs = require("command-line-args");
const command_package_1 = require("./command-package");
const command_workspace_1 = require("./command-workspace");
const optionDefinitions = [
    {
        name: 'repo',
        alias: 'r',
        type: String,
        multiple: true,
        description: 'Repositories to convert.  (This is the default option, so the ' +
            '--repo/-r switch itself is not required.)',
        defaultOption: true
    },
    {
        name: 'workspace-dir',
        alias: 'd',
        type: String,
        defaultValue: 'modulizer_workspace',
        description: 'Override the default path "modulizer_workspace" where the repositories ' +
            'will be cloned to.'
    },
    {
        name: 'github-token',
        alias: 'g',
        type: String,
        description: 'Provide github token via command-line flag instead of ' +
            '"github-token" file.'
    },
    {
        name: 'help',
        type: Boolean,
        description: 'Show this help message.',
    },
    {
        name: 'version',
        type: Boolean,
        description: 'Display the version number and exit',
    },
    {
        name: 'out',
        type: String,
        defaultValue: 'modulizer_out',
        description: 'The directory to write converted files to.'
    },
    { name: 'in', type: String, description: 'The directory to convert.' },
    {
        name: 'namespace',
        type: String,
        description: 'Namespace name(s) to use to detect exports. ' +
            'Namespaces documented in the code with @namespace will be ' +
            'automatically detected.',
        multiple: true
    },
    {
        name: 'exclude',
        type: String,
        multiple: true,
        description: 'File(s) to exclude from conversion.',
        defaultValue: []
    },
    {
        name: 'delete-files',
        type: String,
        multiple: true,
        description: 'After conversion, delete all files that match any of these glob ' +
            'patterns.',
        defaultValue: []
    },
    {
        name: 'dependency-mapping',
        type: String,
        multiple: true,
        description: 'A set of mapping instructions to map unknown bower ' +
            'dependencies to npm. ' +
            'Must be of the format: "[bower name],[npm name],[npm semver range]".' +
            'Example: "polymer,@polymer/polymer,^X.X.X". ' +
            'Multiple mappings allowed.',
        defaultValue: []
    },
    {
        name: 'npm-name',
        type: String,
        description: 'npm package name to use for package.json'
    },
    {
        name: 'npm-version',
        type: String,
        description: 'Version string to use for package.json'
    },
    {
        name: 'clean',
        type: Boolean,
        defaultValue: false,
        description: 'If given, clear the existing build/workspace folder ' +
            +'before beginning.'
    },
    {
        name: 'force',
        type: Boolean,
        defaultValue: false,
        description: `If given, may overwrite or delete files when converting the given ` +
            `input directory.`,
    },
    {
        name: 'install',
        type: Boolean,
        defaultValue: false,
        description: `If given, installs dependencies in all repos after workspace conversion.`,
    },
    {
        name: 'test',
        type: Boolean,
        defaultValue: false,
        description: `Run tests after workspace conversion.`,
    },
    {
        name: 'push',
        type: Boolean,
        defaultValue: false,
        description: `Push changes to GitHub after conversion (will prompt to confirm).`,
    },
    {
        name: 'publish',
        type: Boolean,
        defaultValue: false,
        description: `Publish changes to npm after conversion (will prompt to confirm).`,
    },
    {
        name: 'import-style',
        type: String,
        defaultValue: 'path',
        description: `[name|path] The desired format for npm package import URLs/specifiers. ` +
            `Defaults to "path".`,
    },
    {
        name: 'add-import-meta',
        type: Boolean,
        defaultValue: false,
        description: `Whether to add a static importMeta property to ` +
            `elements. Defaults to false`,
    },
    {
        name: 'flat',
        type: Boolean,
        defaultValue: false,
        description: `Whether to set flat:true in the newly generated package.json.`,
    },
    {
        name: 'private',
        type: Boolean,
        defaultValue: false,
        description: `Whether to set private:true in the newly generated package.json.`,
    },
    {
        name: 'package-type',
        type: String,
        defaultValue: 'element',
        description: `[element|application] The type of package that is to be modulized. ` +
            `Defaults to "element"`,
    },
];
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = commandLineArgs(optionDefinitions);
        if (options['help']) {
            const getUsage = require('command-line-usage');
            const usage = getUsage([
                {
                    header: 'modulizer',
                    content: `Convert HTML Imports to JavaScript modules

If no GitHub repository names are given, modulizer converts the current
directory as a package. If repositories are provided, they are cloned into a
workspace directory as sibling folders as they would be in a Bower
installation.
`,
                },
                {
                    header: 'Options',
                    optionList: optionDefinitions,
                }
            ]);
            console.log(usage);
            return;
        }
        if (options['version']) {
            console.log(require('../../package.json').version);
            return;
        }
        if (options['repo']) {
            yield command_workspace_1.default(options);
            return;
        }
        const importStyle = options['import-style'];
        if (importStyle !== 'name' && importStyle !== 'path') {
            throw new Error(`import-style "${importStyle}" not supported. ` +
                `Supported styles: "name", "path".`);
        }
        const packageType = options['package-type'];
        if (packageType !== 'element' && packageType !== 'application') {
            throw new Error(`package-type "${packageType}" is not supported. ` +
                `Supported types: "element", "application".`);
        }
        yield command_package_1.default(options);
    });
}
exports.run = run;
//# sourceMappingURL=index.js.map