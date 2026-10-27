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
const fuzzaldrin = require("fuzzaldrin");
const css_custom_property_scanner_1 = require("polymer-analyzer/lib/css/css-custom-property-scanner");
const vscode_languageserver_1 = require("vscode-languageserver");
const feature_finder_1 = require("./feature-finder");
const util_1 = require("./util");
/**
 * Gets the definition of a feature at a position.
 */
class DefinitionFinder extends util_1.Handler {
    constructor(connection, converter, featureFinder, analyzer, settings) {
        super();
        this.connection = connection;
        this.converter = converter;
        this.featureFinder = featureFinder;
        this.analyzer = analyzer;
        this.connection.onDefinition((textPosition) => __awaiter(this, void 0, void 0, function* () {
            return this.handleErrors(this.getDefinition(textPosition), null);
        }));
        this.connection.onReferences((params) => __awaiter(this, void 0, void 0, function* () {
            return this.handleErrors(this.getReferences(params), []);
        }));
        this.connection.onWorkspaceSymbol((params) => __awaiter(this, void 0, void 0, function* () {
            const analysis = yield this.analyzer.analyzePackage({ reason: 'get workspace symbols' });
            const symbols = this.findSymbols(analysis);
            return fuzzaldrin.filter(symbols, params.query, { key: 'name' });
        }));
        this.connection.onDocumentSymbol((params) => __awaiter(this, void 0, void 0, function* () {
            const url = params.textDocument.uri;
            const analysis = yield this.analyzer.analyze([url], { reason: 'get document symbols' });
            const result = analysis.getDocument(url);
            if (!result.successful) {
                return [];
            }
            return this.findSymbols(result.value);
        }));
        this.connection.onCodeLens((params) => __awaiter(this, void 0, void 0, function* () {
            const lenses = [];
            if (settings.referencesCodeLens) {
                lenses.push(...yield this.handleErrors(this.getCodeLenses(params), []));
            }
            return lenses;
        }));
    }
    /**
     * Return the location or locations where the symbol referenced at the given
     * location is defined.
     *
     * Implements:
     * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md#textDocument_definition
     */
    getDefinition(textPosition, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceRanges = yield this.getDefinitionsForFeatureAtPosition(textPosition.textDocument.uri, this.converter.convertPosition(textPosition.position), analysis);
            return sourceRanges.map((sr) => {
                return { uri: sr.file, range: this.converter.convertPRangeToL(sr) };
            });
        });
    }
    getDefinitionsForFeatureAtPosition(url, position, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            analysis = analysis ||
                (yield this.analyzer.analyze([url], { reason: 'get definitions' }));
            const featureResult = yield this.featureFinder.getFeatureAt(url, position, analysis);
            if (!featureResult) {
                return [];
            }
            const { feature } = featureResult;
            if (feature instanceof css_custom_property_scanner_1.CssCustomPropertyUse ||
                feature instanceof css_custom_property_scanner_1.CssCustomPropertyAssignment) {
                const assignments = analysis.getFeatures({
                    kind: 'css-custom-property-assignment',
                    id: feature.name,
                    externalPackages: true
                });
                return [...assignments].map((a) => a.sourceRange);
            }
            if (feature instanceof feature_finder_1.DatabindingFeature) {
                if (feature.property && feature.property.sourceRange) {
                    return [feature.property.sourceRange];
                }
                return [];
            }
            if (feature.sourceRange) {
                return [feature.sourceRange];
            }
            return [];
        });
    }
    /**
     * Get all places that the symbol being referenced at the given place is
     * referenced in the package.
     *
     * Implements:
     * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md#textDocument_references
     */
    getReferences(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const locations = [];
            const localPath = this.converter.getWorkspacePathToFile(params.textDocument);
            const position = this.converter.convertPosition(params.position);
            const analysis = yield this.analyzer.analyzePackage({ reason: 'get references' });
            if (params.context.includeDeclaration) {
                locations.push(...yield this.getDefinition(params, analysis));
            }
            const result = analysis.getDocument(localPath);
            if (!result.successful) {
                return locations;
            }
            const document = result.value;
            const astResult = yield this.featureFinder.getAstAtPosition(document, position);
            if (!astResult) {
                return locations;
            }
            if (astResult.language === 'css') {
                const featureResult = this.featureFinder.getFeatureForAstLocation(astResult, position);
                if (featureResult) {
                    if (featureResult.feature instanceof css_custom_property_scanner_1.CssCustomPropertyAssignment ||
                        featureResult.feature instanceof css_custom_property_scanner_1.CssCustomPropertyUse) {
                        const propertyUses = [...analysis.getFeatures({
                                kind: 'css-custom-property-use',
                                id: featureResult.feature.name
                            })];
                        locations.push(...propertyUses.map((f) => {
                            return {
                                uri: f.sourceRange.file,
                                range: this.converter.convertPRangeToL(f.sourceRange)
                            };
                        }));
                    }
                }
            }
            else if (astResult.node.kind === 'tagName') {
                const ranges = [...analysis.getFeatures({
                        kind: 'element-reference',
                        id: astResult.node.element.tagName,
                        externalPackages: true,
                    })].map((e) => e.sourceRange);
                locations.push(...ranges.map((r) => {
                    return { uri: r.file, range: this.converter.convertPRangeToL(r) };
                }));
            }
            return locations;
        });
    }
    findSymbols(queryable) {
        // Most kinds of symbols are covered by JS and TS analyzers. We can
        // help track down custom elements by tag name though.
        const symbols = [];
        const elements = queryable.getFeatures({ kind: 'element', externalPackages: true });
        for (const element of elements) {
            if (!element.sourceRange) {
                continue;
            }
            if (element.tagName) {
                symbols.push({
                    kind: vscode_languageserver_1.SymbolKind.Class,
                    location: this.converter.getLocation(element.sourceRange),
                    name: element.tagName
                });
            }
        }
        const polymerCoreFeatures = queryable.getFeatures({ kind: 'polymer-core-feature', externalPackages: true });
        for (const coreFeature of polymerCoreFeatures) {
            if (!coreFeature.sourceRange) {
                continue;
            }
            for (const identifier of coreFeature.identifiers) {
                symbols.push({
                    kind: vscode_languageserver_1.SymbolKind.Method,
                    location: this.converter.getLocation(coreFeature.sourceRange),
                    name: identifier
                });
            }
        }
        return symbols;
    }
    getCodeLenses(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield this.analyzer.analyzePackage({ reason: 'get code lenses' });
            const uri = params.textDocument.uri;
            const result = analysis.getDocument(uri);
            if (!result.successful) {
                return [];
            }
            const document = result.value;
            const lenses = [];
            for (const element of document.getFeatures({ kind: 'element' })) {
                if (!element.sourceRange || !element.tagName) {
                    continue;
                }
                const refs = analysis.getFeatures({ kind: 'element-reference', id: element.tagName });
                lenses.push(this.makeLens(element.sourceRange, `Referenced ${refs.size} place${plural(refs.size)} in HTML.`));
            }
            for (const cssProperty of document.getFeatures({ kind: 'css-custom-property-assignment' })) {
                const refs = analysis.getFeatures({ kind: 'css-custom-property-use', id: cssProperty.name });
                lenses.push(this.makeLens(cssProperty.sourceRange, `Read ${refs.size} place${plural(refs.size)}.`));
            }
            return lenses;
        });
    }
    makeLens(sourceRange, message) {
        const rangeStart = this.converter.convertSourcePosition(sourceRange.start);
        return {
            range: {
                start: rangeStart,
                end: { line: rangeStart.line + 1, character: 0 },
            },
            command: { title: message, command: '' }
        };
    }
}
exports.default = DefinitionFinder;
function plural(count) {
    return count === 1 ? '' : 's';
}
//# sourceMappingURL=definition-finder.js.map