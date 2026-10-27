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
const polymer_project_config_1 = require("polymer-project-config");
const util = require("util");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const analyzer_synchronizer_1 = require("./analyzer-synchronizer");
const auto_completer_1 = require("./auto-completer");
const commands_1 = require("./commands");
const converter_1 = require("./converter");
const definition_finder_1 = require("./definition-finder");
const diagnostics_1 = require("./diagnostics");
const feature_finder_1 = require("./feature-finder");
const file_synchronizer_1 = require("./file-synchronizer");
const hover_documenter_1 = require("./hover-documenter");
const logger_1 = require("./logger");
const settings_1 = require("./settings");
const util_1 = require("./util");
class LanguageServer extends util_1.Handler {
    /** Get an initialized and ready language server. */
    static initializeWithConnection(connection, loggingOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            function getWorkspaceUri(rootUri, rootPath) {
                if (rootUri) {
                    return vscode_uri_1.default.parse(rootUri);
                }
                if (rootPath) {
                    return vscode_uri_1.default.file(rootPath);
                }
                return null;
            }
            // When we get an initialization request we want to construct a server and
            // tell the client about its capabilities.
            const server = yield new Promise((resolve, reject) => {
                connection.onInitialize((params) => __awaiter(this, void 0, void 0, function* () {
                    // Normalize across the two ways that the workspace may be
                    // communicated to us.
                    const workspaceUri = getWorkspaceUri(params.rootUri, params.rootPath);
                    if (!workspaceUri || workspaceUri.scheme !== 'file') {
                        const error = new Error(`Got invalid workspaceUri from client: ` +
                            `${util.inspect(workspaceUri)}`);
                        reject(error);
                        throw error;
                    }
                    const { urlResolver } = yield polymer_project_config_1.ProjectConfig.initializeAnalyzerFromDirectory(workspaceUri.fsPath);
                    const newServer = new LanguageServer(connection, workspaceUri, params.capabilities, urlResolver, loggingOptions.logToFile);
                    resolve(newServer);
                    return { capabilities: newServer.capabilities(params.capabilities) };
                }));
            });
            // The console will be valid immediately after the connection has
            // initialized. So hook it up then (if requested).
            if (loggingOptions.interceptConsole) {
                const { hookUpRemoteConsole } = yield Promise.resolve().then(() => require('../intercept-logs'));
                hookUpRemoteConsole(connection.console);
            }
            return server;
        });
    }
    /**
     * Called once we've got an initialized connection, a working polymer
     * editor service, and a workspace.
     */
    constructor(connection, workspaceUri, clientCapabilities, urlResolver, logToFile) {
        super();
        this.disposables.push(connection);
        this.connection = connection;
        const logger = new logger_1.Logger({ connection, logToFileFlag: logToFile });
        this.disposables.push(logger);
        const workspacePath = workspaceUri.fsPath;
        // TODO(rictic): try out implementing an incrementally synced version of
        //     TextDocuments. Should be a performance win for editing large docs.
        const documents = new vscode_languageserver_1.TextDocuments();
        documents.listen(connection);
        this.syncKind = documents.syncKind;
        const converter = new converter_1.default(workspaceUri, urlResolver);
        this.fileSynchronizer = new file_synchronizer_1.default(connection, documents, workspacePath, converter, logger);
        logger.log(`\n\n\n\n\nInitialized with workspace path: ${workspacePath}`);
        logger.log(`Client's capabilities:`);
        logger.log(JSON.stringify(clientCapabilities, null, 2));
        logger.log(`\n\nServer's capabilities:`);
        logger.log(JSON.stringify(this.capabilities(clientCapabilities), null, 2));
        const analyzerSynchronizer = new analyzer_synchronizer_1.default(documents, this.fileSynchronizer, logger, urlResolver, converter);
        const settings = new settings_1.default(connection, this.fileSynchronizer, analyzerSynchronizer.analyzer);
        this.disposables.push(settings);
        logger.hookupSettings(settings);
        const diagnosticGenerator = new diagnostics_1.default(analyzerSynchronizer.analyzer, converter, connection, settings, analyzerSynchronizer, documents);
        this.disposables.push(diagnosticGenerator);
        const commandExecutor = new commands_1.default(this.connection, diagnosticGenerator);
        this.disposables.push(commandExecutor);
        const featureFinder = new feature_finder_1.default(analyzerSynchronizer.analyzer);
        const hoverDocumenter = new hover_documenter_1.default(this.connection, converter, featureFinder, logger);
        this.disposables.push(hoverDocumenter);
        const autoCompleter = new auto_completer_1.default(this.connection, converter, featureFinder, analyzerSynchronizer.analyzer, clientCapabilities);
        this.disposables.push(autoCompleter);
        const definitionFinder = new definition_finder_1.default(this.connection, converter, featureFinder, analyzerSynchronizer.analyzer, settings);
        this.disposables.push(definitionFinder);
    }
    capabilities(clientCapabilities) {
        const ourCapabilities = {
            textDocumentSync: { change: this.syncKind, openClose: true, willSaveWaitUntil: true },
            completionProvider: { resolveProvider: false },
            hoverProvider: true,
            definitionProvider: true,
            codeActionProvider: true,
            referencesProvider: true,
            documentSymbolProvider: true,
            workspaceSymbolProvider: true,
            codeLensProvider: {},
        };
        // If the client can apply edits, then we can handle the
        // polymer-ide/applyEdit command, which just delegates to the client's
        // applyEdit functionality. Otherwise the client plugin can handle the
        // polymer-ide/applyEdit if it wants that feature.
        if (clientCapabilities.workspace &&
            clientCapabilities.workspace.applyEdit) {
            ourCapabilities.executeCommandProvider = { commands: commands_1.allSupportedCommands };
        }
        return ourCapabilities;
    }
}
exports.default = LanguageServer;
//# sourceMappingURL=language-server.js.map