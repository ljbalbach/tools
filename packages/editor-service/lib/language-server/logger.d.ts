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
import { IConnection } from 'vscode-languageserver/lib/main';
import Settings from './settings';
export declare class Logger {
    private readonly connection;
    private logFile;
    private readonly logFileFromFlag;
    private settings;
    private queue;
    constructor(options: {
        connection: IConnection;
        logToFileFlag: string | undefined;
    });
    hookupSettings(settings: Settings): Promise<void>;
    dispose(): void;
    log(message: string): void;
}
