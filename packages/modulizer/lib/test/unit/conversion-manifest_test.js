"use strict";
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const conversion_manifest_1 = require("../../conversion-manifest");
const workspace_url_handler_1 = require("../../urls/workspace-url-handler");
const workspaceDir = __dirname;
const manifestsDir = path.join(__dirname, '../../../fixtures/manifests');
suite('src/conversion-manifest', () => {
    let analyzer;
    let urlHandler;
    beforeEach(() => {
        const urlResolver = new polymer_analyzer_1.PackageUrlResolver({ packageDir: workspaceDir });
        const urlLoader = new polymer_analyzer_1.InMemoryOverlayUrlLoader(new polymer_analyzer_1.FsUrlLoader(workspaceDir));
        analyzer = new polymer_analyzer_1.Analyzer({
            urlLoader,
            urlResolver,
        });
        urlHandler = new workspace_url_handler_1.WorkspaceUrlHandler(analyzer, workspaceDir);
    });
    suite('serializePackageScanResult()', () => {
        test('serialize a basic package scan result to a JSON manifest', () => __awaiter(this, void 0, void 0, function* () {
            const scanResultJson = yield fs_extra_1.readJson(path.join(manifestsDir, 'simple_expected.json'));
            const expectedManifestResult = yield fs_extra_1.readJson(path.join(manifestsDir, 'simple_source.json'));
            const actualResult = conversion_manifest_1.serializePackageScanResult(new Map(scanResultJson[0]), new Map(scanResultJson[1]), urlHandler);
            chai_1.assert.deepEqual(actualResult, expectedManifestResult);
        }));
    });
    suite('filesJsonObjectToMap()', () => {
        test('deserialize a basic package scan JSON manifest to a scan result', () => __awaiter(this, void 0, void 0, function* () {
            const manifestJson = yield fs_extra_1.readJson(path.join(manifestsDir, 'simple_source.json'));
            const expectedResult = yield fs_extra_1.readJson(path.join(manifestsDir, 'simple_expected.json'));
            const actualResult = conversion_manifest_1.filesJsonObjectToMap('paper-behaviors', '@polymer/paper-behaviors', manifestJson, urlHandler);
            chai_1.assert.deepEqual([...actualResult[0]], expectedResult[0]);
            chai_1.assert.deepEqual([...actualResult[1]], expectedResult[1]);
        }));
        test('`convertedFilePath` is generated from `convertedUrl`, not `originalUrl`.', () => __awaiter(this, void 0, void 0, function* () {
            const manifestJson = yield fs_extra_1.readJson(path.join(manifestsDir, 'renaming_source.json'));
            const expectedResult = yield fs_extra_1.readJson(path.join(manifestsDir, 'renaming_expected.json'));
            const actualResult = conversion_manifest_1.filesJsonObjectToMap('some-package', '@some-owner/some-package', manifestJson, urlHandler);
            chai_1.assert.deepEqual([...actualResult[0]], expectedResult[0]);
            chai_1.assert.deepEqual([...actualResult[1]], expectedResult[1]);
        }));
    });
});
//# sourceMappingURL=conversion-manifest_test.js.map