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
import { SourcePosition, SourceRange, UrlLoader, UrlResolver } from 'polymer-analyzer';
import { CodeUnderliner as BaseUnderliner } from 'polymer-analyzer/lib/test/test-utils';
import { ClientCapabilities, CodeLens, CompletionList, Definition, Diagnostic, FileChangeType, Hover, IConnection, Location, LocationLink, SymbolInformation } from 'vscode-languageserver';
import { InitializeResult } from 'vscode-languageserver-protocol';
import AnalyzerLSPConverter from '../language-server/converter';
import FileSynchronizer from '../language-server/file-synchronizer';
import LanguageServer from '../language-server/language-server';
import { SettingsJson } from '../language-server/settings';
export declare function createTestConnections(debugging?: boolean): {
    serverConnection: IConnection;
    clientConnection: IConnection;
};
export declare function createFileSynchronizer(baseDir?: string, debugging?: boolean): {
    synchronizer: FileSynchronizer;
    serverConnection: IConnection;
    clientConnection: IConnection;
    baseDir: string;
    converter: AnalyzerLSPConverter;
};
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
export declare function createTestEnvironment(options?: {
    fixtureDir?: string;
    debugging?: boolean;
    capabilities?: ClientCapabilities;
}): Promise<{
    client: TestClient;
    server: LanguageServer;
    baseDir: string;
    initResult: InitializeResult;
    underliner: Underliner;
    converter: AnalyzerLSPConverter;
}>;
export declare class Underliner extends BaseUnderliner {
    private converter;
    constructor(urlLoader: UrlLoader, urlResolver: UrlResolver, converter: AnalyzerLSPConverter);
    underline(reference: SourceRange | undefined): Promise<string>;
    underline(references: Array<SourceRange | undefined>): Promise<string[]>;
    underline(location: Location | undefined): Promise<string>;
    underline(location: Array<Location | undefined>): Promise<string[]>;
    underline(location: Location | Array<Location> | Array<LocationLink> | undefined | null): Promise<string | Array<string>>;
    underline(location: undefined | null): Promise<string>;
    underlineDiagnostics(diagnostics: Diagnostic[], path: string): Promise<string[]>;
}
export declare const defaultClientCapabilities: ClientCapabilities;
export declare class TestClient {
    connection: IConnection;
    converter: AnalyzerLSPConverter;
    private baseDir;
    constructor(connection: IConnection, converter: AnalyzerLSPConverter, baseDir: string);
    /**
     * Disposes of the client and its resources.
     *
     * Asserts that there are no unconsumed diagnostics, which might
     * indicate an unexpected error.
     */
    cleanup(): Promise<void>;
    initialize(baseDir: string, capabilities: ClientCapabilities): Promise<InitializeResult>;
    changeConfiguration(settings: Partial<SettingsJson>): Promise<void>;
    getHover(path: string, position: SourcePosition): Promise<Hover | null>;
    getDefinition(path: string, position: SourcePosition): Promise<Definition | LocationLink[] | null>;
    private openFiles;
    openFile(filePath: string, initialContents?: string): Promise<void>;
    changeFile(path: string, updatedContents: string): Promise<void>;
    closeFile(path: string): Promise<void>;
    watchedFilesChanged(changes: {
        path: string;
        type: FileChangeType;
    }[]): Promise<void>;
    private diagnosticsForPath;
    private handleDiagnostics;
    getNextDiagnostics(path: string): Promise<Diagnostic[]>;
    getCompletions(path: string, position: SourcePosition): Promise<CompletionList>;
    getReferences(path: string, position: SourcePosition, includeDefinition?: boolean): Promise<Location[] | null>;
    getWorkspaceSymbols(query: string): Promise<null | SymbolInformation[]>;
    getDocumentSymbols(filePath: string): Promise<import("vscode-languageserver-types").DocumentSymbol[] | SymbolInformation[] | null>;
    getCodeLenses(path: string): Promise<null | CodeLens[]>;
    private latestVersionMap;
    private getNextVersionFor;
}
export declare function getTempCopy(fromDir: string): string;
export declare function copyDir(fromDir: string, toDir: string): void;
/** Fails if the given promise either resolves or rejects within the timeout. */
export declare function assertDoesNotSettle(promise: Promise<{} | null | undefined>, timeoutMs?: number): Promise<{}>;
export declare function delay(millis: number): Promise<void>;
