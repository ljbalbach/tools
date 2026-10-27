/**
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
import { IConnection } from 'vscode-languageserver';
import DiagnosticGenerator from './diagnostics';
import { Handler } from './util';
export declare const applyEditCommandName = "polymer-ide/applyEdit";
export declare const applyAllFixesCommandName = "polymer-ide/applyAllFixes";
export declare const allSupportedCommands: string[];
/**
 * Execute Commands sent from the client.
 *
 * Commands are honestly one of the most confusing parts of the language server
 * protocol. In short, they are an open namespace of actions. Commands are a key
 * part of a few LSP features, including Code Actions.
 *
 * In the initial version of the spec they were something that the server asked
 * the client to do, but that's unsatisfying because it requires special code
 * for every client. So as of v3 of the protocol, the server can declare
 * commands that it can handle.
 *
 * This class is responsible for executing those commands.
 */
export default class CommandExecutor extends Handler {
    protected connection: IConnection;
    private diagnosticGenerator;
    constructor(connection: IConnection, diagnosticGenerator: DiagnosticGenerator);
    /**
     * Used to edit code as a Code Action. The protocol conversation is unusually
     * complicated, so it's worth spelling out:
     *
     *   < Server publishes diagnostics
     *   - User moves cursor over diagnostic
     *   > Client asks for code actions
     *   < Server sends back code actions with commands that have the
     *     our applyEditCommandName
     *   - User chooses to run a code action.
     *   > Client asks server to execute the command.
     *   < This method sends an request to the client to apply these edits.
     */
    private executeApplyEditCommand;
    private executeApplyAllFixesCommand;
    private applyEdits;
}
