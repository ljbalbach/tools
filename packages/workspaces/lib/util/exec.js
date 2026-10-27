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
const util = require("util");
const { promisify } = util;
const { execFile: _execFile } = require('child_process');
const execFile = promisify(_execFile);
/**
 * A helper function for working with Node's core execFile() method.
 */
function exec(cwd, command, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandOptions = Object.assign({}, options, { cwd: cwd });
        try {
            const { stdout, stderr } = yield execFile(command, args, commandOptions);
            // Trim unneccesary extra newlines/whitespace from exec/execFile output
            return { stdout: stdout.trim(), stderr: stderr.trim() };
        }
        catch (err) {
            // If an error happens, attach the working directory to the error object
            err.cwd = cwd;
            throw err;
        }
    });
}
exports.default = exec;
/**
 * A helper function to check whether a shell command exists or not.
 * Useful for user-facing warnings.
 */
function checkCommand(commandName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // the "command" command will exit with an error code, which Node
            // will throw from execFile() as an error object.
            yield execFile('command', ['-v', commandName]);
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
exports.checkCommand = checkCommand;
//# sourceMappingURL=exec.js.map