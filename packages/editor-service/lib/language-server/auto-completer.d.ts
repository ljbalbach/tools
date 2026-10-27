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
import { ClientCapabilities, IConnection } from 'vscode-languageserver';
import { LsAnalyzer } from './analyzer-synchronizer';
import AnalyzerLSPConverter from './converter';
import FeatureFinder from './feature-finder';
import { Handler } from './util';
/**
 * Handles as-you-type autocompletion.
 *
 * It registers on construction so that the client knows it can be called to
 * give suggested completions at a given position.
 */
export default class AutoCompleter extends Handler {
    protected connection: IConnection;
    private converter;
    private featureFinder;
    private analyzer;
    private capabilities;
    private readonly clientCannotFilter;
    private readonly clientSupportsSnippets;
    private readonly preferredDocumentationFormat;
    constructor(connection: IConnection, converter: AnalyzerLSPConverter, featureFinder: FeatureFinder, analyzer: LsAnalyzer, capabilities: ClientCapabilities);
    private autoComplete;
    private getTypeaheadCompletionsAtPosition;
    private getCustomPropertyAssignmentCompletions;
    private getCustomPropertyUseCompletions;
    private getDatabindingCompletions;
    private getElementTagCompletions;
    private generateAutoCompletionForElement;
    private getAttributeValueCompletions;
    private getSlotNameCompletions;
    private getAncestorDomModuleForElement;
    private getAttributeCompletions;
    private getStandardJavaScriptSnippetCompletions;
    private createSortPrefixes;
    private attributeCompletionToCompletionItem;
    private filterCompletions;
    /**
     * If the client supports markdown for completion items, send our markdown as
     * markdown.
     *
     * Otherwise send it as plain text.
     */
    documentationFromMarkdown(markdown: string): string | {
        kind: "markdown";
        value: string;
    };
    /**
     * Gets the identifier that comes right before the given source position.
     *
     * So e.g. calling it at the end of "hello world" should return "world", but
     * calling it with the line 0, character 4 should return "hell".
     */
    private getLeadingIdentifier;
}
