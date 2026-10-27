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
import { ExecOptions } from 'child_process';
export interface ExecResult {
    stdout: string;
    stderr: string;
}
/**
 * A helper function for working with Node's core execFile() method.
 */
export default function exec(cwd: string, command: string, args?: string[], options?: ExecOptions): Promise<ExecResult>;
/**
 * A helper function to check whether a shell command exists or not.
 * Useful for user-facing warnings.
 */
export declare function checkCommand(commandName: string): Promise<boolean>;
