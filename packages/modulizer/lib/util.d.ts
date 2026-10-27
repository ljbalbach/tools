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
/// <reference types="node" />
import * as babel from '@babel/types';
import { ExecOptions } from 'child_process';
import * as estree from 'estree';
import { WorkspaceRepo } from 'polymer-workspaces';
import { ConvertedDocumentFilePath } from './urls/types';
/**
 * Helper promisified "mkdirp" library function.
 */
export declare const mkdirp: any;
/**
 * Helper promisified "rimraf" library function.
 */
export declare const rimraf: any;
/**
 * Write each file to the out-directory.
 */
export declare function writeFileResults(outDir: string, files: Map<ConvertedDocumentFilePath, string | undefined>): Promise<void[]>;
/**
 * The exec() helper return type.
 */
export interface ExecResult {
    stdout: string;
    stderr: string;
}
/**
 * A helper function for working with Node's core execFile() method.
 */
export declare function exec(cwd: string, command: string, args?: string[], options?: ExecOptions): Promise<ExecResult>;
/**
 * Log an error that occurred when performing some task on a workspace repo.
 */
export declare function logRepoError(err: Error, repo: WorkspaceRepo): void;
/**
 * Log a user-facing message about progress through some set of steps.
 */
export declare function logStep(stepNum: number, totalNum: number, emoji: string, msg: string): void;
/**
 * Check if a file exists at the given path. If it does, read it as JSON and
 * cast to the given type. If not, return undefined.
 */
export declare function readJsonIfExists<T>(filepath: string): Promise<T | undefined>;
/**
 * Delete all files matching any of the given glob patterns, rooted in the given
 * directory, excluding any file in node_modules/ or bower_components/.
 */
export declare function deleteGlobsSafe(globs: Iterable<string>, cwd: string): Promise<void>;
export declare function babelNodeToEstreeNode(node: babel.Node): estree.Node;
