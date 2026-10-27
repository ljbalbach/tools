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
import { SourceRange } from 'polymer-analyzer';
import { CodeLens, IConnection } from 'vscode-languageserver';
import { LsAnalyzer } from './analyzer-synchronizer';
import AnalyzerLSPConverter from './converter';
import FeatureFinder from './feature-finder';
import Settings from './settings';
import { Handler } from './util';
/**
 * Gets the definition of a feature at a position.
 */
export default class DefinitionFinder extends Handler {
    protected connection: IConnection;
    private converter;
    private featureFinder;
    private analyzer;
    constructor(connection: IConnection, converter: AnalyzerLSPConverter, featureFinder: FeatureFinder, analyzer: LsAnalyzer, settings: Settings);
    /**
     * Return the location or locations where the symbol referenced at the given
     * location is defined.
     *
     * Implements:
     * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md#textDocument_definition
     */
    private getDefinition;
    private getDefinitionsForFeatureAtPosition;
    /**
     * Get all places that the symbol being referenced at the given place is
     * referenced in the package.
     *
     * Implements:
     * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md#textDocument_references
     */
    private getReferences;
    private findSymbols;
    private getCodeLenses;
    makeLens(sourceRange: SourceRange, message: string): CodeLens;
}
