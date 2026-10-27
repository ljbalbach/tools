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
import { IConnection, TextDocuments, WorkspaceEdit } from 'vscode-languageserver';
import AnalyzerSynchronizer, { LsAnalyzer } from './analyzer-synchronizer';
import AnalyzerLSPConverter from './converter';
import Settings from './settings';
import { Handler } from './util';
/**
 * Handles publishing diagnostics and code actions on those diagnostics.
 */
export default class DiagnosticGenerator extends Handler {
    private analyzer;
    private converter;
    protected connection: IConnection;
    private settings;
    private documents;
    private linter;
    private warningCodesToFilterOut;
    private fileGlobsToFilterOut;
    constructor(analyzer: LsAnalyzer, converter: AnalyzerLSPConverter, connection: IConnection, settings: Settings, analyzerSynchronizer: AnalyzerSynchronizer, documents: TextDocuments);
    getAllFixes(): Promise<WorkspaceEdit>;
    private getFixesForFile;
    private updateLinter;
    /**
     * Used so that if we don't have any warnings to report for a file on the
     * next go around we can remember to send an empty array.
     */
    private urisReportedWarningsFor;
    private reportWarnings;
    private reportWarningsForOpenFiles;
    private filterWarnings;
    /**
     * Report the given warnings for the package implicitly defined by the
     * workspace.
     *
     * This is pulled out into its own non-async function to document and maintain
     * the invariant that there must not be an await between the initial read of
     * urisReportedWarningsFor and the write of it at the end.
     */
    private reportPackageWarnings;
    private getCodeActions;
    private createApplyEditCommand;
}
