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
const ast_from_source_position_1 = require("../ast-from-source-position");
/**
 * Class responsible for describing the object at a given location in a
 * document.
 */
class FeatureFinder {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }
    /**
     * Given a point in a file, return a high level feature that describes what
     * is going on there, like an Element for an HTML tag.
     */
    getFeatureAt(url, position, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield this.getAstLocationAtPositionAndPath(url, position, analysis);
            if (!location) {
                return;
            }
            return this.getFeatureForAstLocation(location, position);
        });
    }
    /**
     * Given an AstLocation, return a high level feature.
     */
    getFeatureForAstLocation(astWrapperLocation, position) {
        if (astWrapperLocation.language === 'css') {
            const { document, node } = astWrapperLocation;
            const cssFeatures = new Set([
                ...document.getFeatures({ kind: 'css-custom-property-assignment' }),
                ...document.getFeatures({ kind: 'css-custom-property-use' })
            ]);
            const nodeRange = document.parsedDocument.sourceRangeForNode(node);
            if (!nodeRange) {
                return;
            }
            for (const feature of cssFeatures) {
                if (isContained(feature.sourceRange, nodeRange)) {
                    return { document, feature };
                }
            }
            return;
        }
        const document = astWrapperLocation.document;
        const htmlLocation = astWrapperLocation.node;
        if (htmlLocation.kind === 'tagName') {
            const feature = getOnly(document.getFeatures({
                kind: 'element',
                id: htmlLocation.element.nodeName,
                imported: true,
                externalPackages: true
            }));
            if (feature) {
                return { document, feature };
            }
            return;
        }
        else if (htmlLocation.kind === 'attribute') {
            const elements = document.getFeatures({
                kind: 'element',
                id: htmlLocation.element.nodeName,
                imported: true,
                externalPackages: true
            });
            if (elements.size === 0) {
                return;
            }
            const feature = concatMap(elements, (el) => el.attributes.values())
                .find((at) => at.name === htmlLocation.attribute);
            if (feature) {
                return { document, feature };
            }
            return;
        }
        else if (htmlLocation.kind === 'attributeValue' ||
            htmlLocation.kind === 'text') {
            const domModules = document.getFeatures({ kind: 'dom-module' });
            for (const domModule of domModules) {
                if (!domModule.id) {
                    continue;
                }
                const elements = document.getFeatures({
                    kind: 'polymer-element',
                    id: domModule.id,
                    imported: true,
                    externalPackages: true
                });
                if (elements.size !== 1) {
                    continue;
                }
                const element = elements.values().next().value;
                if (polymer_analyzer_1.isPositionInsideRange(position, domModule.sourceRange)) {
                    for (const databinding of domModule.databindings) {
                        if (polymer_analyzer_1.isPositionInsideRange(position, databinding.sourceRange, true)) {
                            for (const prop of databinding.properties) {
                                if (polymer_analyzer_1.isPositionInsideRange(position, prop.sourceRange, true)) {
                                    return {
                                        feature: new DatabindingFeature(element, databinding, prop.name, prop.sourceRange),
                                        document
                                    };
                                }
                            }
                            return {
                                feature: new DatabindingFeature(element, databinding, undefined, undefined),
                                document
                            };
                        }
                    }
                }
            }
        }
    }
    getAstAtPosition(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedDocument = document.parsedDocument;
            if (parsedDocument instanceof polymer_analyzer_1.ParsedHtmlDocument) {
                const node = ast_from_source_position_1.getHtmlAstLocationForPosition(parsedDocument, position);
                // The position is in an inline style tag, so we need to get its
                // Document and recurse through into it to find the best match.
                if (node && node.kind === 'styleTagContents' && node.textNode) {
                    const cssDocuments = document.getFeatures({ kind: 'css-document' });
                    const styleElement = node.textNode.parentNode;
                    for (const cssDocument of cssDocuments) {
                        if (cssDocument.astNode &&
                            cssDocument.astNode.node === styleElement) {
                            return this.getAstAtPosition(cssDocument, position);
                        }
                    }
                }
                return { language: 'html', document, node };
            }
            else if (parsedDocument instanceof polymer_analyzer_1.ParsedCssDocument) {
                return {
                    language: 'css',
                    document,
                    node: ast_from_source_position_1.getCssAstLocationForPosition(parsedDocument, position)
                };
            }
        });
    }
    getAstLocationAtPositionAndPath(url, position, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            analysis = analysis ||
                (yield this.analyzer.analyze([url], { reason: 'get AST location' }));
            const result = analysis.getDocument(url);
            if (!result.successful) {
                return;
            }
            return this.getAstAtPosition(result.value, position);
        });
    }
}
exports.default = FeatureFinder;
class DatabindingFeature {
    constructor(element, expression, propertyName, propertyRange) {
        this.element = element;
        this.expression = expression;
        this.propertyName = propertyName;
        this.property = element.properties.get(propertyName) ||
            element.methods.get(propertyName);
        this.propertyRange = propertyRange;
    }
}
exports.DatabindingFeature = DatabindingFeature;
function concatMap(inputs, f) {
    const results = [];
    for (const input of inputs) {
        results.push(...f(input));
    }
    return results;
}
function getOnly(set) {
    if (set.size !== 1) {
        return undefined;
    }
    return set.values().next().value;
}
function isContained(inner, outer) {
    return polymer_analyzer_1.isPositionInsideRange(inner.start, outer, true) &&
        polymer_analyzer_1.isPositionInsideRange(inner.end, outer, true);
}
//# sourceMappingURL=feature-finder.js.map