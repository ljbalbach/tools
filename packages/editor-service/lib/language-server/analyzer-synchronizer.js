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
const polymer_analyzer_1 = require("polymer-analyzer");
const vscode_languageserver_1 = require("vscode-languageserver");
const util_1 = require("./util");
/**
 * Exposes an Analyzer that is always in sync with the client's state,
 * and that can give the versions of open files when a given Analysis was
 * generated.
 */
class AnalyzerSynchronizer extends util_1.AutoDisposable {
    constructor(documents, fileSynchronizer, logger, urlResolver, converter) {
        super();
        this.documents = documents;
        this.converter = converter;
        const { fire, stream } = util_1.EventStream.create();
        this.analysisChanges = stream;
        const analysisVersionMap = new WeakMap();
        this.analyzer = new LsAnalyzer(this.documents, logger, analysisVersionMap, {
            urlLoader: fileSynchronizer.urlLoader,
            urlResolver,
        });
        this.disposables.push(fileSynchronizer.fileChanges.listen((filesChangeEvents) => {
            this.handleFilesChanged(filesChangeEvents, fire);
        }));
    }
    handleFilesChanged(fileChangeEvents, onComplete) {
        return __awaiter(this, void 0, void 0, function* () {
            const uris = fileChangeEvents.map((f) => f.uri);
            // Changes to polymer.json are handled through the Settings object.
            // If the analyzer ever starts to care about that file we should listen to
            // the Settings change stream here for it, in order to avoid doing duplicate
            // work.
            fileChangeEvents = fileChangeEvents.filter((change) => this.converter.getWorkspacePathToFile(change) !== 'polymer.json');
            if (fileChangeEvents.length === 0) {
                return; // no new information in this notification
            }
            const deletedUris = fileChangeEvents
                .filter((change) => change.type === vscode_languageserver_1.FileChangeType.Deleted)
                .map((change) => change.uri);
            if (deletedUris.length > 0) {
                // When a directory is deleted we may not be told about individual
                // files, we'll have to determine the tracked files ourselves.
                // This involves mucking around in private implementation details of
                // the analyzer, so we wrap this in a try/catch.
                // Analyzer issue for a supported API:
                // https://github.com/Polymer/polymer-analyzer/issues/761
                try {
                    const context = yield this.analyzer['_analysisComplete'];
                    const cache = context['_cache'];
                    const cachedUris = new Set([
                        ...cache.failedDocuments.keys(),
                        ...cache.parsedDocumentPromises['_keyToResultMap'].keys()
                    ]);
                    for (const deletedUri of deletedUris) {
                        const deletedDir = deletedUri + '/';
                        for (const cachedUri of cachedUris) {
                            if (cachedUri.startsWith(deletedDir)) {
                                uris.push(cachedUri);
                            }
                        }
                    }
                }
                catch (_a) {
                    // Mucking about in analyzer internals on a best effort basis here.
                }
            }
            // Clear the files from any caches and recalculate warnings as needed.
            const filesChangedPromise = this.analyzer.filesChanged(uris);
            // After we've called filesChanged, future calls to analyze will get
            // the updated results, we don't need to wait on the filesChangedPromise
            // to actually resolve.
            onComplete(undefined);
            yield filesChangedPromise;
        });
    }
}
exports.default = AnalyzerSynchronizer;
/**
 * An extension of the analyzer that's aware of the LSP versions of
 * in-memory files at the time an analysis is generated.
 */
class LsAnalyzer extends polymer_analyzer_1.Analyzer {
    constructor(documents, logger, analysisVersionMap, options) {
        super(options);
        this.documents = documents;
        this.logger = logger;
        this.analysisVersionMap = analysisVersionMap;
    }
    analyze(files, options = {}) {
        const prefix = options.reason ? `${options.reason}: ` : '';
        this.logger.log(`${prefix}Analyzing files: ${files.join(', ')}`);
        const start = (new Date().getTime());
        const result = this.annotateWithVersionMap(super.analyze(files, options));
        result.then(() => {
            const end = (new Date().getTime());
            const elapsed = ((end - start) / 1000).toFixed(2);
            this.logger.log(`${prefix}Took ${elapsed}s to analyze files: ${files.join(', ')}`);
        });
        return result;
    }
    analyzePackage(options = {}) {
        const prefix = options.reason ? `${options.reason}: ` : '';
        this.logger.log(`${prefix}Analyzing package...`);
        const start = (new Date().getTime());
        const result = this.annotateWithVersionMap(super.analyzePackage(options));
        result.then(() => {
            const end = (new Date().getTime());
            const elapsed = ((end - start) / 1000).toFixed(2);
            this.logger.log(`${prefix}:Took ${elapsed}s to analyze package.`);
        });
        return result;
    }
    annotateWithVersionMap(promise) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionMap = new Map();
            for (const document of this.documents.all()) {
                versionMap.set(document.uri, document.version);
            }
            const analysis = yield promise;
            this.analysisVersionMap.set(analysis, versionMap);
            return analysis;
        });
    }
    /**
     * Gives a map from URI to version number for all open files at the moment
     * that the given Analysis was generated.
     *
     * This is useful for getting versions right when applying edits.
     */
    getVersionsAtAnalysis(analysis) {
        return this.analysisVersionMap.get(analysis);
    }
}
exports.LsAnalyzer = LsAnalyzer;
//# sourceMappingURL=analyzer-synchronizer.js.map