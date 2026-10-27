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
Object.defineProperty(exports, "__esModule", { value: true });
const ix_1 = require("ix");
const jsc = require("jscodeshift");
/**
 * Get all namespace names for an analysis object.
 */
function getNamespaceNames(analysis) {
    return ix_1.Iterable
        .from(analysis.getFeatures({ kind: 'namespace', externalPackages: true, imported: true }))
        .map((n) => {
        const name = n.name;
        if (name.startsWith('window.')) {
            return name.slice('window.'.length);
        }
        return name;
    });
}
/**
 * Setup the default conversion settings based on the project analysis and the
 * incomplete user-provided options.
 */
function createDefaultConversionSettings(analysis, options) {
    // Configure "namespaces":
    const namespaces = new Set(getNamespaceNames(analysis).concat(options.namespaces || []));
    // Configure "packageEntrypoints":
    const packageEntrypoints = options.packageEntrypoints || new Map();
    // Configure "excludes":
    const excludes = new Set([...(options.excludes || []), 'neon-animation/web-animations.html']);
    // Configure "referenceExcludes":
    const referenceExcludes = new Set(options.referenceExcludes || [
        'Polymer.DomModule',
        'Polymer.Settings',
        'Polymer.log',
        'Polymer.rootPath',
        'Polymer.sanitizeDOMValue',
        'Polymer.Collection',
    ]);
    // Configure "referenceRewrites":
    const referenceRewrites = new Map([
        [
            'document.currentScript.ownerDocument',
            jsc.memberExpression(jsc.identifier('window'), jsc.identifier('document'))
        ],
    ]);
    // Configure "npmImportStyle":
    const npmImportStyle = options.npmImportStyle || 'path';
    // Configure "npmImportStyle", defaults to false
    const addImportMeta = options.addImportMeta === true;
    // Return configured settings.
    return {
        namespaces,
        packageEntrypoints,
        excludes,
        referenceExcludes,
        referenceRewrites,
        npmImportStyle,
        addImportMeta,
    };
}
exports.createDefaultConversionSettings = createDefaultConversionSettings;
//# sourceMappingURL=conversion-settings.js.map