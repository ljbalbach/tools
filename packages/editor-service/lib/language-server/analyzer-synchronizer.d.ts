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
import { Analysis, Analyzer, AnalyzerOptions, UrlResolver } from 'polymer-analyzer';
import { AnalyzeOptions } from 'polymer-analyzer/lib/core/analyzer';
import { TextDocuments } from 'vscode-languageserver';
import AnalyzerLSPConverter from './converter';
import FileSynchronizer from './file-synchronizer';
import { Logger } from './logger';
import { AutoDisposable, EventStream } from './util';
/**
 * Exposes an Analyzer that is always in sync with the client's state,
 * and that can give the versions of open files when a given Analysis was
 * generated.
 */
export default class AnalyzerSynchronizer extends AutoDisposable {
    private readonly documents;
    private readonly converter;
    readonly analyzer: LsAnalyzer;
    /**
     * An event stream that fires every time files have changed such that
     * re-analyzing may give different results.
     *
     * We don't expose the list of files changed here because the file the
     * user is interested in may depend on one of the files changed. The
     * Analyzer is smart about this, so we'll return cached results almost
     * instantly if nothing has actually changed.
     */
    readonly analysisChanges: EventStream<void>;
    constructor(documents: TextDocuments, fileSynchronizer: FileSynchronizer, logger: Logger, urlResolver: UrlResolver, converter: AnalyzerLSPConverter);
    private handleFilesChanged;
}
export interface LsAnalyzeOptions extends AnalyzeOptions {
    reason?: string;
}
/**
 * An extension of the analyzer that's aware of the LSP versions of
 * in-memory files at the time an analysis is generated.
 */
export declare class LsAnalyzer extends Analyzer {
    private documents;
    private logger;
    private analysisVersionMap;
    constructor(documents: TextDocuments, logger: Logger, analysisVersionMap: WeakMap<Analysis, ReadonlyMap<string, number>>, options: AnalyzerOptions);
    analyze(files: string[], options?: LsAnalyzeOptions): Promise<Analysis>;
    analyzePackage(options?: LsAnalyzeOptions): Promise<Analysis>;
    private annotateWithVersionMap;
    /**
     * Gives a map from URI to version number for all open files at the moment
     * that the given Analysis was generated.
     *
     * This is useful for getting versions right when applying edits.
     */
    getVersionsAtAnalysis(analysis: Analysis): ReadonlyMap<string, number>;
}
