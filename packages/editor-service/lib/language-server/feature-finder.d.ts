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
import { Attribute, Document, Element, Method, Property, SourcePosition, SourceRange } from 'polymer-analyzer';
import { CssCustomPropertyAssignment, CssCustomPropertyUse } from 'polymer-analyzer/lib/css/css-custom-property-scanner';
import { Analysis } from 'polymer-analyzer/lib/model/analysis';
import { DatabindingExpression } from 'polymer-analyzer/lib/polymer/expression-scanner';
import { AstLocation } from '../ast-from-source-position';
import { LsAnalyzer } from './analyzer-synchronizer';
export interface FoundFeature {
    /**
     * The containing document, which in the case of inline documents, may not be
     * the document you started with!
     */
    document: Document;
    feature: Element | Property | Attribute | DatabindingFeature | CssCustomPropertyAssignment | CssCustomPropertyUse;
}
/**
 * Class responsible for describing the object at a given location in a
 * document.
 */
export default class FeatureFinder {
    private analyzer;
    constructor(analyzer: LsAnalyzer);
    /**
     * Given a point in a file, return a high level feature that describes what
     * is going on there, like an Element for an HTML tag.
     */
    getFeatureAt(url: string, position: SourcePosition, analysis?: Analysis): Promise<FoundFeature | undefined>;
    /**
     * Given an AstLocation, return a high level feature.
     */
    getFeatureForAstLocation(astWrapperLocation: AstLocation, position: SourcePosition): FoundFeature | undefined;
    getAstAtPosition(document: Document, position: SourcePosition): Promise<AstLocation | undefined>;
    getAstLocationAtPositionAndPath(url: string, position: SourcePosition, analysis?: Analysis): Promise<AstLocation | undefined>;
}
export declare class DatabindingFeature {
    /** The element contains the databinding expression. */
    element: Element;
    expression: DatabindingExpression;
    /**
     * If present, this represents a particular property on `element` that's
     * referenced in the databinding expression.
     */
    propertyName: string | undefined;
    /**
     * The property or method on Element corresponding to `propertyName` if
     * one could be found.
     */
    property: Property | Method | undefined;
    propertyRange: SourceRange | undefined;
    constructor(element: Element, expression: DatabindingExpression, propertyName: string | undefined, propertyRange: SourceRange | undefined);
}
