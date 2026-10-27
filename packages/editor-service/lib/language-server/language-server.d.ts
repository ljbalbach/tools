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
import { UrlResolver } from 'polymer-analyzer';
import { ClientCapabilities, IConnection } from 'vscode-languageserver';
import Uri from 'vscode-uri';
import FileSynchronizer from './file-synchronizer';
import { Handler } from './util';
export interface LoggingOptions {
    interceptConsole: boolean;
    logToFile?: string;
}
export default class LanguageServer extends Handler {
    protected readonly connection: IConnection;
    readonly fileSynchronizer: FileSynchronizer;
    private readonly syncKind;
    /** Get an initialized and ready language server. */
    static initializeWithConnection(connection: IConnection, loggingOptions: LoggingOptions): Promise<LanguageServer>;
    /**
     * Called once we've got an initialized connection, a working polymer
     * editor service, and a workspace.
     */
    constructor(connection: IConnection, workspaceUri: Uri, clientCapabilities: ClientCapabilities, urlResolver: UrlResolver, logToFile: string | undefined);
    private capabilities;
}
