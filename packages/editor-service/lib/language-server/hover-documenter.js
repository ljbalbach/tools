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
const css_custom_property_scanner_1 = require("polymer-analyzer/lib/css/css-custom-property-scanner");
const feature_finder_1 = require("./feature-finder");
const util_1 = require("./util");
/**
 * Gets documentation for tooltips (i.e. docmentation-on-hover)
 */
class HoverDocumenter extends util_1.Handler {
    constructor(connection, converter, featureFinder, logger) {
        super();
        this.connection = connection;
        this.converter = converter;
        this.featureFinder = featureFinder;
        this.logger = logger;
        this.connection.onHover((textPosition) => __awaiter(this, void 0, void 0, function* () {
            logger.log(`Hover request: ${textPosition.position.line}:${textPosition.position.character} in ${textPosition.textDocument}`);
            return yield this.handleErrors(this.getDocsForHover(textPosition), undefined);
        }));
    }
    getDocsForHover(textPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentation = yield this.getDocumentationAndRangeAtPosition(textPosition.textDocument.uri, this.converter.convertPosition(textPosition.position));
            if (!documentation) {
                return;
            }
            const result = { contents: documentation.contents, range: undefined };
            if (documentation.range) {
                result.range = this.converter.convertPRangeToL(documentation.range);
            }
            return result;
        });
    }
    getDocumentationAndRangeAtPosition(url, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield this.featureFinder.getAstLocationAtPositionAndPath(url, position);
            if (!location) {
                this.logger.log(`No location`);
                return;
            }
            const featureResult = this.featureFinder.getFeatureForAstLocation(location, position);
            if (!featureResult) {
                this.logger.log(`No feature`);
                return;
            }
            const { feature } = featureResult;
            if (feature instanceof css_custom_property_scanner_1.CssCustomPropertyAssignment ||
                feature instanceof css_custom_property_scanner_1.CssCustomPropertyUse) {
                return;
            }
            if (feature instanceof feature_finder_1.DatabindingFeature) {
                const property = feature.property;
                if (property && property.description) {
                    return { contents: property.description, range: feature.propertyRange };
                }
                return;
            }
            let description = feature.description;
            if ('type' in feature) {
                if (feature.type) {
                    description = `{${feature.type}} ${feature.description}`;
                }
            }
            if (!description) {
                return;
            }
            this.logger.log(`Found hover description: ${description}`);
            let range = undefined;
            if (location.language === 'html') {
                const parsedDoc = location.document.parsedDocument;
                if (location.node.kind === 'tagName') {
                    range = parsedDoc.sourceRangeForStartTag(location.node.element);
                }
                else if (location.node.kind === 'attribute' &&
                    location.node.attribute != null) {
                    range = parsedDoc.sourceRangeForAttributeName(location.node.element, location.node.attribute);
                }
            }
            return { contents: description, range };
        });
    }
}
exports.default = HoverDocumenter;
//# sourceMappingURL=hover-documenter.js.map