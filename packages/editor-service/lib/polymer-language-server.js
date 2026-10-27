"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright multiple authors.
 * See ../LICENSE for license information.
 ------------------------------------------------------------------------------------------
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
const optionDescriptors = [
    { name: 'help', type: Boolean },
    { name: 'version', type: Boolean },
    { name: 'logToFile', type: String },
    // these args are passed in by vscode by default, even though
    // we don't care about them right now we don't want to fail
    // if they're given.
    { name: 'stdio' },
    { name: 'clientProcessId', type: Number }
];
const options = commandLineArgs(optionDescriptors, {});
/**
 * Implements the [language server protocol][1] v3.0 for Web Components and
 * Polymer.
 *
 * Communicates over stdin/stdout.
 *
 * [1]: https://github.com/Microsoft/language-server-protocol
 */
function main(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // This import *must* come before all others.
        yield Promise.resolve().then(() => require('./intercept-logs'));
        //
        const { createConnection } = yield Promise.resolve().then(() => require('vscode-languageserver'));
        const { default: LanguageServer } = yield Promise.resolve().then(() => require('./language-server/language-server'));
        // Create a connection for the server. Communicate using stdio.
        const connection = createConnection(process.stdin, process.stdout);
        const serverPromise = LanguageServer.initializeWithConnection(connection, { interceptConsole: true, logToFile: options.logToFile });
        connection.listen();
        yield serverPromise;
    });
}
const version = require('../package.json').version;
if (options.help) {
    console.log(`Usage: polymer-editor-service

    Polymer Editor Service v${version}

    Speaks the Language Server Protocol over stdin/stdout.
    Hook it up to your editor, and configure it for HTML,
    JS, CSS, and JSON files.

    More info at https://github.com/Polymer/polymer-editor-service

Options:
  --help:       print this message
  --version:    print version
  --logToFile:  append logs to the file at this path
`);
}
else if (options.version) {
    console.log(`Polymer Editor Service v${version}`);
}
else {
    main(options).catch((err) => {
        console.error(`Failed to initialize polymer editor service:`);
        console.error(err);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=polymer-language-server.js.map