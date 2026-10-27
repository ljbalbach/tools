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
import { Analyzer } from 'polymer-analyzer';
import { ProjectConfig } from 'polymer-project-config';
import { Diagnostic, IConnection } from 'vscode-languageserver';
import FileSynchronizer from './file-synchronizer';
import { AutoDisposable, Change, EventStream } from './util';
export interface SettingsJson {
    readonly analyzeWholePackage: boolean;
    readonly fixOnSave: boolean;
    readonly referencesCodeLens: boolean;
    readonly logToClient: boolean;
    readonly logToFile: string | undefined;
}
export interface SettingsChangedHandler {
    (latest: SettingsJson, previous: SettingsJson): void;
}
export interface ProjectConfigInfo {
    projectConfig: ProjectConfig;
    diagnostic: Diagnostic | null;
}
export default class Settings extends AutoDisposable {
    private readonly analyzer;
    static readonly defaults: SettingsJson;
    private latest;
    private readonly fileSynchronizer;
    readonly changeStream: EventStream<Change<SettingsJson>>;
    projectConfig: ProjectConfig;
    projectConfigDiagnostic: Diagnostic | null;
    readonly projectConfigChangeStream: EventStream<Change<ProjectConfigInfo>>;
    private readonly fireProjectConfigChange;
    /**
     * A promise that resolves once the initial configuration has probably been
     * received from the client.
     *
     * There's no way to know for certain though, because it's asynchronous, so
     * after a timeout this will resolve either way.
     */
    readonly ready: Promise<void>;
    constructor(connection: IConnection, fileSynchronizer: FileSynchronizer, analyzer: Analyzer);
    private updateProjectConfig;
    readonly analyzeWholePackage: boolean;
    readonly fixOnSave: boolean;
    readonly referencesCodeLens: boolean;
    readonly logToClient: boolean;
    readonly logToFile: string | undefined;
}
