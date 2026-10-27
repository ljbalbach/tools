"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const util_1 = require("./util");
exports.applyEditCommandName = 'polymer-ide/applyEdit';
exports.applyAllFixesCommandName = 'polymer-ide/applyAllFixes';
exports.allSupportedCommands = [exports.applyEditCommandName, exports.applyAllFixesCommandName];
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
class CommandExecutor extends util_1.Handler {
    constructor(connection, diagnosticGenerator) {
        super();
        this.connection = connection;
        this.diagnosticGenerator = diagnosticGenerator;
        connection.onExecuteCommand((req) => __awaiter(this, void 0, void 0, function* () {
            if (req.command === exports.applyEditCommandName) {
                return this.handleErrors(this.executeApplyEditCommand(req.arguments), undefined);
            }
            if (req.command === exports.applyAllFixesCommandName) {
                return this.handleErrors(this.executeApplyAllFixesCommand(), undefined);
            }
        }));
    }
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
    executeApplyEditCommand(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.applyEdits(args[0]);
        });
    }
    executeApplyAllFixesCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceEdit = yield this.diagnosticGenerator.getAllFixes();
            yield this.applyEdits(workspaceEdit);
        });
    }
    applyEdits(workspaceEdit) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { edit: workspaceEdit };
            return (yield this.connection.sendRequest(vscode_languageserver_1.ApplyWorkspaceEditRequest.type.method, params));
        });
    }
}
exports.default = CommandExecutor;
//# sourceMappingURL=commands.js.map