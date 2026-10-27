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
import { UrlLoader } from 'polymer-analyzer';
import { FileEvent, IConnection, TextDocuments } from 'vscode-languageserver';
import AnalyzerLSPConverter from './converter';
import { Logger } from './logger';
import { AutoDisposable, EventStream } from './util';
/**
 * Handles synchronizing and firing events for changes to files, either in
 * open text editors or on disk.
 *
 * This class is responsible for maintaining a URL Loader that always returns
 * the latest known content for a given url when requested, and for exposing an
 * EventStream of FileEvents.
 */
export default class FileSynchronizer extends AutoDisposable {
    /** This maps workspace path to content of our in-memory documents. */
    private inMemoryDocuments;
    readonly urlLoader: UrlLoader;
    fileChanges: EventStream<FileEvent[]>;
    constructor(connection: IConnection, documents: TextDocuments, baseDir: string, converter: AnalyzerLSPConverter, logger: Logger);
}
