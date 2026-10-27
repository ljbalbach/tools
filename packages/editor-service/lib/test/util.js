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
const chai_1 = require("chai");
const fs = require("fs");
const os = require("os");
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const test_utils_1 = require("polymer-analyzer/lib/test/test-utils");
const stream_1 = require("stream");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const vscode_uri_1 = require("vscode-uri");
const converter_1 = require("../language-server/converter");
const file_synchronizer_1 = require("../language-server/file-synchronizer");
const language_server_1 = require("../language-server/language-server");
const logger_1 = require("../language-server/logger");
function createTestConnections(debugging) {
    const up = new TestStream('up', debugging);
    const down = new TestStream('down', debugging);
    const serverConnection = vscode_languageserver_1.createConnection(up, down);
    const clientConnection = vscode_languageserver_1.createConnection(down, up);
    serverConnection.listen();
    clientConnection.listen();
    return { serverConnection, clientConnection };
}
exports.createTestConnections = createTestConnections;
function createFileSynchronizer(baseDir, debugging) {
    if (baseDir) {
        baseDir = getTempCopy(baseDir);
    }
    else {
        baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'editor-service-tests'));
    }
    const { serverConnection, clientConnection } = createTestConnections(debugging);
    const textDocuments = new vscode_languageserver_1.TextDocuments();
    textDocuments.listen(serverConnection);
    const converter = new converter_1.default(vscode_uri_1.default.file(baseDir), new polymer_analyzer_1.PackageUrlResolver({ packageDir: baseDir }));
    const synchronizer = new file_synchronizer_1.default(serverConnection, textDocuments, baseDir, converter, new logger_1.Logger({ connection: serverConnection, logToFileFlag: undefined }));
    return { synchronizer, serverConnection, clientConnection, baseDir, converter };
}
exports.createFileSynchronizer = createFileSynchronizer;
/**
 * Creates a full test environment for integration testing.
 *
 * The results include a running server and a test client with slightly
 * friendlier wrapper methods around the raw protocol requests, as well as
 * a configured underliner for producing squiggle underlined strings for
 * asserting against.                    ~~~~~~~~~~~~~~~~~~~
 *
 * So tests written using this method can use the client as a fake text editor,
 * and send requests up to the server, then assert on the responses from the
 * server.
 *
 * @param fixtureDir If given, then the test environment will be set up with a
 *     copy of the given basedir in os.tempdir() as the client's workspace.
 *     If this param is not passed, an empty tempdir will be used.
 * @param debugging If true, does extra logging about the requests and responses
 *     between client and server.
 */
function createTestEnvironment(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const capabilities = options.capabilities || exports.defaultClientCapabilities;
        const baseDir = options.fixtureDir === undefined ?
            fs.mkdtempSync(path.join(os.tmpdir(), 'editor-service-tests')) :
            getTempCopy(options.fixtureDir);
        const { serverConnection, clientConnection } = createTestConnections(options.debugging);
        const urlResolver = new polymer_analyzer_1.PackageUrlResolver({ packageDir: baseDir });
        const converter = new converter_1.default(vscode_uri_1.default.file(baseDir), urlResolver);
        const client = new TestClient(clientConnection, converter, baseDir);
        const serverPromise = language_server_1.default.initializeWithConnection(serverConnection, { interceptConsole: false });
        const initResult = yield client.initialize(baseDir, capabilities);
        const server = yield serverPromise;
        const underliner = new Underliner(server.fileSynchronizer.urlLoader, urlResolver, converter);
        // First we create a linter with no config. Then we finish trying to load
        // polymer.json and create another linter. Both times we report empty
        // set of diagnostics for polymer.json
        // If we don't wait for this to happen, we can get flaky tests.
        chai_1.assert.deepEqual(yield client.getNextDiagnostics('polymer.json'), []);
        chai_1.assert.deepEqual(yield client.getNextDiagnostics('polymer.json'), []);
        return { client, server, baseDir, initResult, underliner, converter };
    });
}
exports.createTestEnvironment = createTestEnvironment;
class Underliner extends test_utils_1.CodeUnderliner {
    constructor(urlLoader, urlResolver, converter) {
        super(urlLoader, urlResolver);
        this.converter = converter;
    }
    // tslint:disable-next-line: no-any Crazily overloaded function.
    underline(location) {
        const _super = Object.create(null, {
            underline: { get: () => super.underline }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (location == null) {
                return `Got nullish value instead of location.`;
            }
            if (Array.isArray(location)) {
                return Promise.all(location.map((l) => this.underline(l)));
            }
            if (vscode_languageserver_1.Location.is(location)) {
                const range = this.converter.convertLRangeToP(location.range, location);
                if (!range) {
                    return `Could not resolve LSP URL: ${location.uri}`;
                }
                return this.underline(range);
            }
            return _super.underline.call(this, location);
        });
    }
    underlineDiagnostics(diagnostics, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = { uri: this.converter.getUriForLocalPath(path) };
            return this.underline(diagnostics.map((d) => this.converter.convertLRangeToP(d.range, document)));
        });
    }
}
exports.Underliner = Underliner;
exports.defaultClientCapabilities = {
    textDocument: {
        completion: {
            completionItem: {
                snippetSupport: true,
                documentationFormat: ['markdown', 'plaintext'],
                commitCharactersSupport: false,
            },
            contextSupport: false,
        },
        synchronization: { didSave: true, willSave: true, willSaveWaitUntil: true },
        implementation: { dynamicRegistration: false },
        typeDefinition: {},
        colorProvider: {},
        foldingRange: {},
        declaration: {}
    },
    workspace: {
        applyEdit: true,
        workspaceEdit: { documentChanges: true },
        configuration: false,
        didChangeConfiguration: {},
        didChangeWatchedFiles: {},
        executeCommand: {},
        symbol: {},
        workspaceFolders: false
    }
};
class TestClient {
    constructor(connection, converter, baseDir) {
        this.connection = connection;
        this.converter = converter;
        this.baseDir = baseDir;
        this.openFiles = new Set();
        this.diagnosticsForPath = new MapSetDefault((key) => new StreamWithNext(key));
        this.latestVersionMap = new Map();
        connection.onNotification(vscode_languageserver_1.PublishDiagnosticsNotification.type, (params) => {
            this.handleDiagnostics(params);
        });
    }
    /**
     * Disposes of the client and its resources.
     *
     * Asserts that there are no unconsumed diagnostics, which might
     * indicate an unexpected error.
     */
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            // Wait for a moment longer to see if any more diagnostics are
            // reported.
            yield new Promise((resolve) => setTimeout(resolve, 1));
            this.connection.dispose();
            for (const [path, stream] of this.diagnosticsForPath) {
                const diagnosticBatches = stream.consumeQueue();
                for (const batch of diagnosticBatches) {
                    if (batch.length > 0) {
                        throw new Error(`Found unconsumed diagnostics while cleaning up client. Path: ${path} [${batch.map((d) => d.code).join(', ')}]`);
                    }
                }
            }
        });
    }
    initialize(baseDir, capabilities) {
        return __awaiter(this, void 0, void 0, function* () {
            const init = {
                rootPath: baseDir,
                rootUri: vscode_uri_1.default.file(baseDir).toString(),
                // If we specify a process id the server will call
                // process.exit after a timeout if the given process id
                // does not exist!! It handles `null` just fine though.
                // tslint:disable-next-line: no-any
                processId: null,
                initializationOptions: {},
                // It looks like the typechecker is messing up here?
                capabilities,
                workspaceFolders: null,
            };
            return this.connection.sendRequest(vscode_languageserver_protocol_1.InitializeRequest.type, init, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    changeConfiguration(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { settings: { 'polymer-ide': settings } };
            return this.connection.sendNotification(vscode_languageserver_1.DidChangeConfigurationNotification.type, params);
        });
    }
    getHover(path, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                position: this.converter.convertSourcePosition(position),
                textDocument: { uri: this.converter.getUriForLocalPath(path) }
            };
            return this.connection.sendRequest(vscode_languageserver_1.HoverRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    getDefinition(path, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                position: this.converter.convertSourcePosition(position),
                textDocument: { uri: this.converter.getUriForLocalPath(path) }
            };
            return this.connection.sendRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    openFile(filePath, initialContents) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openFiles.has(filePath)) {
                throw new Error(`${filePath} is already open`);
            }
            this.openFiles.add(filePath);
            if (initialContents === undefined) {
                initialContents =
                    fs.readFileSync(path.join(this.baseDir, filePath), 'utf-8');
            }
            const params = {
                textDocument: {
                    languageId: guessLanguageId(filePath),
                    text: initialContents,
                    uri: this.converter.getUriForLocalPath(filePath),
                    version: this.getNextVersionFor(filePath)
                }
            };
            return this.connection.sendNotification(vscode_languageserver_1.DidOpenTextDocumentNotification.type, params);
        });
    }
    changeFile(path, updatedContents) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.openFiles.has(path)) {
                throw new Error(`Tried to change ${path} before opening it`);
            }
            const params = {
                textDocument: {
                    uri: this.converter.getUriForLocalPath(path),
                    version: this.getNextVersionFor(path)
                },
                contentChanges: [{
                        range: {
                            start: { line: 0, character: 0 },
                            end: { line: Math.pow(10, 10), character: Math.pow(10, 10) }
                        },
                        rangeLength: undefined,
                        text: updatedContents
                    }]
            };
            return this.connection.sendNotification(vscode_languageserver_1.DidChangeTextDocumentNotification.type, params);
        });
    }
    closeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.openFiles.has(path)) {
                throw new Error(`Tried to close ${path} when it was not open.`);
            }
            this.openFiles.delete(path);
            const params = {
                textDocument: { uri: this.converter.getUriForLocalPath(path) }
            };
            return this.connection.sendNotification(vscode_languageserver_1.DidCloseTextDocumentNotification.type, params);
        });
    }
    watchedFilesChanged(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                changes: changes.map((change) => {
                    return {
                        uri: this.converter.getUriForLocalPath(change.path),
                        type: change.type
                    };
                })
            };
            return this.connection.sendNotification(vscode_languageserver_1.DidChangeWatchedFilesNotification.type, params);
        });
    }
    handleDiagnostics(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.converter.getWorkspacePathToFile(params);
            this.diagnosticsForPath.get(path).push(params.diagnostics);
        });
    }
    getNextDiagnostics(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.diagnosticsForPath.get(path).next();
        });
    }
    getCompletions(path, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                position: this.converter.convertSourcePosition(position),
                textDocument: { uri: this.converter.getUriForLocalPath(path) }
            };
            return this.connection.sendRequest(vscode_languageserver_1.CompletionRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    getReferences(path, position, includeDefinition = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                position: this.converter.convertSourcePosition(position),
                textDocument: { uri: this.converter.getUriForLocalPath(path) },
                context: { includeDeclaration: includeDefinition }
            };
            return this.connection.sendRequest(vscode_languageserver_1.ReferencesRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    getWorkspaceSymbols(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { query };
            return this.connection.sendRequest(vscode_languageserver_1.WorkspaceSymbolRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    getDocumentSymbols(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                textDocument: { uri: this.converter.getUriForLocalPath(filePath) }
            };
            return this.connection.sendRequest(vscode_languageserver_1.DocumentSymbolRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    getCodeLenses(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                textDocument: { uri: this.converter.getUriForLocalPath(path) }
            };
            return this.connection.sendRequest(vscode_languageserver_1.CodeLensRequest.type, params, vscode_languageserver_protocol_1.CancellationToken.None);
        });
    }
    getNextVersionFor(path) {
        let version = this.latestVersionMap.get(path);
        if (version == null) {
            version = -1;
        }
        version++;
        this.latestVersionMap.set(path, version);
        return version;
    }
}
exports.TestClient = TestClient;
function guessLanguageId(path) {
    if (path.endsWith('.html')) {
        return 'html';
    }
    else if (path.endsWith('.js')) {
        return 'javascript';
    }
    else if (path.endsWith('.json')) {
        return 'json';
    }
    else if (path.endsWith('.css')) {
        return 'css';
    }
    throw new Error(`Can't guess language id for: ${path}`);
}
class StreamWithNext {
    constructor(key, debugging = false) {
        this.key = key;
        this.debugging = debugging;
        this.queue = [];
        this.wakeup = () => undefined;
        this.wakeupPromise = undefined;
    }
    log(msg) {
        if (this.debugging) {
            console.log(`${this.key}: ${msg}`);
        }
    }
    push(val) {
        this.log(`pushing a value`);
        this.queue.push(val);
        this.wakeup();
        this.wakeupPromise = undefined;
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                if (this.queue.length > 0) {
                    this.log(`${this.key}: shifting a value`);
                    return this.queue.shift();
                }
                if (!this.wakeupPromise) {
                    this.wakeupPromise = new Promise((resolve) => this.wakeup = resolve);
                }
                this.log(`${this.key}: waiting for a value`);
                yield this.wakeupPromise;
            }
        });
    }
    consumeQueue() {
        const queue = this.queue;
        this.queue = [];
        return queue;
    }
}
class MapSetDefault extends Map {
    constructor(defaultFactory, initial) {
        super(initial || []);
        this.defaultFactory = defaultFactory;
    }
    get(key) {
        let val = super.get(key);
        if (val === undefined) {
            val = this.defaultFactory(key);
            this.set(key, val);
        }
        return val;
    }
}
/** Duplex stream that optionally logs content. */
class TestStream extends stream_1.Duplex {
    constructor(name, debugging) {
        super();
        this.name = name;
        this.debugging = debugging;
    }
    _write(chunk, _encoding, done) {
        if (this.debugging) {
            console.log(`this.name writes: ${chunk}`);
        }
        this.emit('data', chunk);
        done();
    }
    _read(_size) {
    }
}
function getTempCopy(fromDir) {
    const toDir = fs.mkdtempSync(path.join(os.tmpdir(), path.basename(fromDir)));
    copyDir(fromDir, toDir);
    return toDir;
}
exports.getTempCopy = getTempCopy;
function copyDir(fromDir, toDir) {
    for (const inner of fs.readdirSync(fromDir)) {
        const fromInner = path.join(fromDir, inner);
        const toInner = path.join(toDir, inner);
        const stat = fs.statSync(fromInner);
        if (stat.isDirectory()) {
            fs.mkdirSync(toInner);
            copyDir(fromInner, toInner);
        }
        else {
            fs.writeFileSync(toInner, fs.readFileSync(fromInner));
        }
    }
}
exports.copyDir = copyDir;
/** Fails if the given promise either resolves or rejects within the timeout. */
function assertDoesNotSettle(promise, timeoutMs = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            promise.then(() => reject(new Error('Promise resolved, was not expected to settle.')), () => reject(new Error('Promise rejected, was not expected to settle.')));
            setTimeout(resolve, timeoutMs);
        });
    });
}
exports.assertDoesNotSettle = assertDoesNotSettle;
function delay(millis) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => setTimeout(resolve, millis));
    });
}
exports.delay = delay;
//# sourceMappingURL=util.js.map