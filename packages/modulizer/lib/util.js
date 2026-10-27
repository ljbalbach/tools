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
const fse = require("fs-extra");
const ix_1 = require("ix");
const path = require("path");
const _mkdirp = require("mkdirp");
const _rimraf = require("rimraf");
const _glob = require("glob");
const { promisify } = require('util');
const { execFile: _execFile } = require('child_process');
const execFile = promisify(_execFile);
const glob = promisify(_glob);
/**
 * Helper promisified "mkdirp" library function.
 */
exports.mkdirp = promisify(_mkdirp);
/**
 * Helper promisified "rimraf" library function.
 */
exports.rimraf = promisify(_rimraf);
/**
 * Write each file to the out-directory.
 */
function writeFileResults(outDir, files) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(ix_1.Iterable.from(files).map(([newPath, newSource]) => __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(outDir, newPath);
            yield exports.mkdirp(path.dirname(filePath));
            if (newSource !== undefined) {
                yield fse.writeFile(filePath, newSource);
            }
            else if (yield fse.pathExists(filePath)) {
                yield fse.unlink(filePath);
            }
        })));
    });
}
exports.writeFileResults = writeFileResults;
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
exports.exec = exec;
/**
 * Log an error that occurred when performing some task on a workspace repo.
 */
function logRepoError(err, repo) {
    const repoDirName = path.basename(repo.dir);
    console.error(chalk_1.default.red(`${repoDirName}: ${err.message}`), err);
}
exports.logRepoError = logRepoError;
/**
 * Log a user-facing message about progress through some set of steps.
 */
function logStep(stepNum, totalNum, emoji, msg) {
    const stepInfo = `[${stepNum}/${totalNum}]`;
    console.log(`${chalk_1.default.dim(stepInfo)} ${emoji}  ${chalk_1.default.magenta(msg)}`);
}
exports.logStep = logStep;
/**
 * Check if a file exists at the given path. If it does, read it as JSON and
 * cast to the given type. If not, return undefined.
 */
function readJsonIfExists(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield fse.pathExists(filepath)) {
            return yield fse.readJSON(filepath);
        }
        return undefined;
    });
}
exports.readJsonIfExists = readJsonIfExists;
/**
 * Delete all files matching any of the given glob patterns, rooted in the given
 * directory, excluding any file in node_modules/ or bower_components/.
 */
function deleteGlobsSafe(globs, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const toDelete = new Set();
        for (const g of globs) {
            const matches = yield glob(g, {
                cwd,
                absolute: true,
                ignore: [
                    'node_modules/**',
                    'bower_components/**',
                ],
            });
            for (const m of matches) {
                toDelete.add(m);
            }
        }
        yield Promise.all([...toDelete].map((filepath) => fse.remove(filepath)));
    });
}
exports.deleteGlobsSafe = deleteGlobsSafe;
function babelNodeToEstreeNode(node) {
    return node;
}
exports.babelNodeToEstreeNode = babelNodeToEstreeNode;
//# sourceMappingURL=util.js.map