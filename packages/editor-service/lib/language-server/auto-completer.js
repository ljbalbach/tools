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
const dom5 = require("dom5");
const fuzzaldrin = require("fuzzaldrin");
const polymer_analyzer_1 = require("polymer-analyzer");
const css_custom_property_scanner_1 = require("polymer-analyzer/lib/css/css-custom-property-scanner");
const vscode_languageserver_1 = require("vscode-languageserver");
const standard_snippets_1 = require("../standard-snippets");
const feature_finder_1 = require("./feature-finder");
const util_1 = require("./util");
/**
 * Handles as-you-type autocompletion.
 *
 * It registers on construction so that the client knows it can be called to
 * give suggested completions at a given position.
 */
class AutoCompleter extends util_1.Handler {
    constructor(connection, converter, featureFinder, analyzer, capabilities) {
        super();
        this.connection = connection;
        this.converter = converter;
        this.featureFinder = featureFinder;
        this.analyzer = analyzer;
        this.capabilities = capabilities;
        const completionCapabilities = (this.capabilities.textDocument &&
            this.capabilities.textDocument.completion) ||
            {};
        const completionItemCapabilities = completionCapabilities.completionItem || {};
        this.clientSupportsSnippets = !!completionItemCapabilities.snippetSupport;
        this.preferredDocumentationFormat = 'plaintext';
        const preferredFormats = completionItemCapabilities.documentationFormat || ['plaintext'];
        for (const preferredFormat of preferredFormats) {
            if (preferredFormat === 'plaintext' || preferredFormat === 'markdown') {
                this.preferredDocumentationFormat = preferredFormat;
                break;
            }
        }
        // Work around https://github.com/atom/atom-languageclient/issues/150
        const ourExperimentalCapabilities = this.capabilities.experimental &&
            this.capabilities.experimental['polymer-ide'];
        this.clientCannotFilter = ourExperimentalCapabilities ?
            !!ourExperimentalCapabilities.doesNotFilterCompletions :
            false;
        this.connection.onCompletion((request) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.handleErrors(this.autoComplete(request), { isIncomplete: true, items: [] });
            return result;
        }));
    }
    autoComplete(textPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = textPosition.textDocument.uri;
            const result = (yield this.analyzer.analyze([url], {
                reason: 'autocomplete'
            })).getDocument(url);
            if (!result.successful) {
                return { isIncomplete: true, items: [] };
            }
            const document = result.value;
            const position = this.converter.convertPosition(textPosition.position);
            const completions = yield this.getTypeaheadCompletionsAtPosition(document, position);
            if (!completions) {
                return { isIncomplete: true, items: [] };
            }
            if (this.clientCannotFilter) {
                return this.filterCompletions(completions, position, document);
            }
            return completions;
        });
    }
    getTypeaheadCompletionsAtPosition(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const locResult = yield this.featureFinder.getAstAtPosition(document, position);
            if (!locResult) {
                return;
            }
            const result = yield this.featureFinder.getFeatureForAstLocation(locResult, position);
            if (result && (result.feature instanceof feature_finder_1.DatabindingFeature)) {
                return this.getDatabindingCompletions(result.feature);
            }
            if (result && (result.feature instanceof css_custom_property_scanner_1.CssCustomPropertyAssignment)) {
                return this.getCustomPropertyAssignmentCompletions(document, result.feature);
            }
            if (result && (result.feature instanceof css_custom_property_scanner_1.CssCustomPropertyUse)) {
                return this.getCustomPropertyUseCompletions(document);
            }
            if (locResult.language === 'html') {
                const location = locResult.node;
                if (location.kind === 'tagName' || location.kind === 'text') {
                    return this.getElementTagCompletions(document, location);
                }
                if (location.kind === 'attributeValue') {
                    return this.getAttributeValueCompletions(document, location);
                }
                if (location.kind === 'attribute') {
                    return this.getAttributeCompletions(document, location);
                }
                // TODO(timvdlippe): Also return these snippets if the user is in a
                // javascript file (locResult.language === 'js')
                if (location.kind === 'scriptTagContents') {
                    return this.getStandardJavaScriptSnippetCompletions();
                }
            }
        });
    }
    getCustomPropertyAssignmentCompletions(document, assignment) {
        const propertyAssignments = document.getFeatures({
            kind: 'css-custom-property-assignment',
            imported: true,
            externalPackages: true
        });
        const propertyUses = document.getFeatures({
            kind: 'css-custom-property-use',
            imported: true,
            externalPackages: true
        });
        const names = new Set();
        for (const assignment of propertyAssignments) {
            names.add(assignment.name);
        }
        for (const use of propertyUses) {
            names.add(use.name);
        }
        names.delete(assignment.name);
        const items = [...names].sort().map((name) => {
            return { label: name, kind: vscode_languageserver_1.CompletionItemKind.Variable };
        });
        return { isIncomplete: false, items };
    }
    getCustomPropertyUseCompletions(document) {
        const propertyAssignments = document.getFeatures({
            kind: 'css-custom-property-assignment',
            imported: true,
            externalPackages: true
        });
        const names = new Set([...propertyAssignments].map((a) => a.name));
        const items = [...names].sort().map((name) => {
            return { label: name, kind: vscode_languageserver_1.CompletionItemKind.Variable };
        });
        return { isIncomplete: false, items };
    }
    getDatabindingCompletions(feature) {
        const element = feature.element;
        return {
            isIncomplete: false,
            items: [...element.properties.values(), ...element.methods.values()]
                .map((p) => {
                const sortPrefix = p.inheritedFrom ? 'ddd-' : 'aaa-';
                return {
                    label: p.name,
                    documentation: p.description || '',
                    type: p.type,
                    sortText: sortPrefix + p.name,
                    inheritedFrom: p.inheritedFrom
                };
            })
                .sort(compareAttributeResults)
                .map((c) => this.attributeCompletionToCompletionItem(c))
        };
    }
    getElementTagCompletions(document, location) {
        const elements = [
            ...document.getFeatures({ kind: 'element', externalPackages: true, imported: true })
        ].filter((e) => e.tagName);
        const prefix = location.kind === 'tagName' ? '' : '<';
        const items = elements.map((e) => {
            const tagName = e.tagName;
            const item = {
                label: `<${tagName}>`,
                documentation: this.documentationFromMarkdown(e.description),
                filterText: tagName.replace(/-/g, ''),
                kind: vscode_languageserver_1.CompletionItemKind.Class,
                insertText: `${prefix}${e.tagName}></${e.tagName}>`
            };
            if (this.clientSupportsSnippets) {
                item.insertText =
                    `${prefix}${this.generateAutoCompletionForElement(e)}`;
                item.insertTextFormat = vscode_languageserver_1.InsertTextFormat.Snippet;
            }
            return item;
        });
        return { isIncomplete: false, items };
    }
    generateAutoCompletionForElement(e) {
        let autocompletion = `${e.tagName}`;
        let tabindex = 1;
        if (e.attributes.size > 0) {
            autocompletion += ` $${tabindex++}`;
        }
        autocompletion += `>`;
        if (e.slots.length === 1 && !e.slots[0].name) {
            autocompletion += `$${tabindex++}`;
        }
        else {
            for (const slot of e.slots) {
                const tagTabIndex = tabindex++;
                const slotAttribute = slot.name ? ` slot="${slot.name}"` : '';
                autocompletion += '\n\t<${' + tagTabIndex + ':div}' + slotAttribute +
                    '>$' + tabindex++ + '</${' + tagTabIndex + ':div}>';
            }
            if (e.slots.length) {
                autocompletion += '\n';
            }
        }
        return autocompletion + `</${e.tagName}>$0`;
    }
    getAttributeValueCompletions(document, location) {
        if (location.attribute === 'slot') {
            return this.getSlotNameCompletions(document, location);
        }
        const domModule = this.getAncestorDomModuleForElement(document, location.element);
        if (!domModule || !domModule.id) {
            return;
        }
        const [outerElement] = document.getFeatures({
            kind: 'element',
            id: domModule.id,
            imported: true,
            externalPackages: true
        });
        if (!outerElement) {
            return;
        }
        const sortPrefixes = this.createSortPrefixes(outerElement);
        const [innerElement] = document.getFeatures({
            kind: 'element',
            id: location.element.nodeName,
            imported: true,
            externalPackages: true
        });
        if (!innerElement) {
            return;
        }
        const innerAttribute = innerElement.attributes.get(location.attribute);
        if (!innerAttribute) {
            return;
        }
        const attributeValue = dom5.getAttribute(location.element, innerAttribute.name);
        const hasDelimeters = /^\s*(\{\{|\[\[)/.test(attributeValue);
        const attributes = [...outerElement.properties.values()].map((p) => {
            const sortText = (sortPrefixes.get(p.inheritedFrom) || `ddd-`) + p.name;
            let autocompletion;
            const autocompletionSnippet = undefined;
            if (attributeValue && hasDelimeters) {
                autocompletion = p.name;
            }
            else {
                if (innerAttribute.changeEvent) {
                    autocompletion = `{{${p.name}}}`;
                }
                else {
                    autocompletion = `[[${p.name}]]`;
                }
            }
            return {
                label: p.name,
                documentation: p.description || '',
                type: p.type,
                inheritedFrom: p.inheritedFrom,
                sortText,
                autocompletion,
                autocompletionSnippet,
            };
        });
        return {
            isIncomplete: false,
            items: attributes.sort(compareAttributeResults)
                .map((c) => this.attributeCompletionToCompletionItem(c))
        };
    }
    getSlotNameCompletions(document, location) {
        const parent = location.element.parentNode;
        if (!parent || !parent.tagName) {
            return { isIncomplete: false, items: [] };
        }
        const parentDefinitions = document.getFeatures({
            kind: 'element',
            id: parent.tagName,
            imported: true,
            externalPackages: true
        });
        const slotNames = new Set();
        for (const parentDefn of parentDefinitions) {
            for (const slot of parentDefn.slots) {
                if (slot.name) {
                    slotNames.add(slot.name);
                }
            }
        }
        const items = [...slotNames].map((name) => {
            return {
                label: name,
                kind: vscode_languageserver_1.CompletionItemKind.Variable,
            };
        });
        return { isIncomplete: false, items };
    }
    getAncestorDomModuleForElement(document, element) {
        const parsedDocument = document.parsedDocument;
        if (!(parsedDocument instanceof polymer_analyzer_1.ParsedHtmlDocument)) {
            return;
        }
        const elementSourcePosition = parsedDocument.sourceRangeForNode(element).start;
        const domModules = document.getFeatures({ kind: 'dom-module', imported: false });
        for (const domModule of domModules) {
            if (polymer_analyzer_1.isPositionInsideRange(elementSourcePosition, parsedDocument.sourceRangeForNode(domModule.node))) {
                return domModule;
            }
        }
    }
    getAttributeCompletions(document, location) {
        const [element] = document.getFeatures({
            kind: 'element',
            id: location.element.nodeName,
            externalPackages: true,
            imported: true
        });
        const attributes = [];
        if (element) {
            const sortPrefixes = this.createSortPrefixes(element);
            attributes.push(...[...element.attributes.values()].map((p) => {
                const sortText = (sortPrefixes.get(p.inheritedFrom) || `ddd-`) + p.name;
                return {
                    label: p.name,
                    documentation: p.description || '',
                    type: p.type,
                    inheritedFrom: p.inheritedFrom,
                    sortText
                };
            }));
            attributes.push(...[...element.events.values()].map((e) => {
                const postfix = sortPrefixes.get(e.inheritedFrom) || 'ddd-';
                const sortText = `eee-${postfix}on-${e.name}`;
                return {
                    label: `on-${e.name}`,
                    documentation: e.description || '',
                    type: e.type || 'CustomEvent',
                    inheritedFrom: e.inheritedFrom,
                    sortText
                };
            }));
        }
        return {
            isIncomplete: false,
            items: attributes.sort(compareAttributeResults)
                .map((c) => this.attributeCompletionToCompletionItem(c)),
        };
    }
    getStandardJavaScriptSnippetCompletions() {
        return { isIncomplete: false, items: standard_snippets_1.standardJavaScriptSnippets };
    }
    createSortPrefixes(element) {
        // A map from the inheritedFrom to a sort prefix. Note that
        // `undefined` is a legal value for inheritedFrom.
        const sortPrefixes = new Map();
        // Not inherited, that means local! Sort it early.
        sortPrefixes.set(undefined, 'aaa-');
        if (element.superClass) {
            sortPrefixes.set(element.superClass.identifier, 'bbb-');
        }
        if (element.extends) {
            sortPrefixes.set(element.extends, 'ccc-');
        }
        return sortPrefixes;
    }
    attributeCompletionToCompletionItem(attrCompletion) {
        const item = {
            label: attrCompletion.label,
            kind: vscode_languageserver_1.CompletionItemKind.Field,
            documentation: this.documentationFromMarkdown(attrCompletion.documentation),
            sortText: attrCompletion.sortText
        };
        if (attrCompletion.type) {
            item.detail = `{${attrCompletion.type}}`;
        }
        if (attrCompletion.inheritedFrom) {
            if (item.detail) {
                item.detail = `${item.detail} ⊃ ${attrCompletion.inheritedFrom}`;
            }
            else {
                item.detail = `⊃ ${attrCompletion.inheritedFrom}`;
            }
        }
        if (this.clientSupportsSnippets && attrCompletion.autocompletionSnippet) {
            item.insertText = attrCompletion.autocompletionSnippet;
            item.insertTextFormat = vscode_languageserver_1.InsertTextFormat.Snippet;
        }
        else if (attrCompletion.autocompletion) {
            item.insertText = attrCompletion.autocompletion;
        }
        return item;
    }
    filterCompletions(completions, position, document) {
        const leadingText = this.getLeadingIdentifier(position, document);
        const filterableCompletions = completions.items.map((completion) => {
            return {
                filterText: completion.filterText || completion.label,
                completion
            };
        });
        const items = fuzzaldrin
            .filter(filterableCompletions, leadingText, { key: 'filterText' })
            .map((i) => i.completion);
        return { isIncomplete: true, items };
    }
    /**
     * If the client supports markdown for completion items, send our markdown as
     * markdown.
     *
     * Otherwise send it as plain text.
     */
    documentationFromMarkdown(markdown) {
        if (this.preferredDocumentationFormat === 'markdown') {
            return { kind: 'markdown', value: markdown };
        }
        return markdown;
    }
    /**
     * Gets the identifier that comes right before the given source position.
     *
     * So e.g. calling it at the end of "hello world" should return "world", but
     * calling it with the line 0, character 4 should return "hell".
     */
    getLeadingIdentifier(position, document) {
        const contents = document.parsedDocument.contents;
        const endOfSpan = document.parsedDocument.sourcePositionToOffset(position);
        let startOfSpan = endOfSpan;
        while (true) {
            const candidateChar = contents[startOfSpan - 1];
            if (candidateChar === undefined || !candidateChar.match(/[a-zA-Z\-]/)) {
                break;
            }
            startOfSpan--;
        }
        return contents.slice(startOfSpan, endOfSpan);
    }
}
exports.default = AutoCompleter;
/**
 * Compare the two attributes, for sorting.
 *
 * These comparisons need to fit two constraints:
 *   - more useful attributes at the top
 *   - ordering is consistent, so that results don't jump around.
 *
 * Returns a comparison number for `Array#sort`.
 *     -1 means <    0 means ==     1 means >
 */
function compareAttributeResults(a1, a2) {
    let comparison = a1.sortText.localeCompare(a2.sortText);
    if (comparison !== 0) {
        return comparison;
    }
    comparison = (a1.inheritedFrom || '').localeCompare(a2.inheritedFrom || '');
    if (comparison !== 0) {
        return comparison;
    }
    return a1.label.localeCompare(a2.label);
}
//# sourceMappingURL=auto-completer.js.map