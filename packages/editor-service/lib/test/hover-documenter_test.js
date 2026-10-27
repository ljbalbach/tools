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
const chai_1 = require("chai");
const path = require("path");
const util_1 = require("./util");
const fixtureDir = path.join(__dirname, '..', '..', 'src', 'test', 'static');
suite('HoverDocumenter', function () {
    const indexFile = path.join('editor-service', 'index.html');
    const tagPosition = { line: 7, column: 9 };
    const localAttributePosition = { line: 7, column: 31 };
    const deepAttributePosition = { line: 7, column: 49 };
    const tagDescription = 'An element to test out behavior inheritance.';
    const localAttributeDescription = '{boolean | null | undefined} A property defined directly on behavior-test-elem.';
    const deepAttributeDescription = '{Array | null | undefined} This is a deeply inherited property.';
    let testName = 'it supports getting the element description ' +
        'when asking for docs at its tag name';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner, converter } = yield util_1.createTestEnvironment({ fixtureDir });
        const { contents, range } = (yield client.getHover('editor-service/index.html', tagPosition));
        chai_1.assert.deepEqual(contents, tagDescription);
        const sourceRange = converter.convertLRangeToP(range, { uri: converter.getUriForLocalPath('editor-service/index.html') });
        chai_1.assert.deepEqual(yield underliner.underline(sourceRange), `
  <behavior-test-elem local-property deeply-inherited-property="foo">
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
        yield client.cleanup();
    }));
    testName = 'it can still get element info after changing a file in memory';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client, server } = yield util_1.createTestEnvironment({ fixtureDir });
        const contents = yield server.fileSynchronizer.urlLoader.load(client.converter.getAnalyzerUrl({ uri: indexFile }));
        // Add a newline at the beginning of the file, shifting the lines
        // down.
        yield client.openFile(indexFile, `\n${contents}`);
        yield server.fileSynchronizer.fileChanges.next;
        chai_1.assert.deepEqual(yield client.getHover(indexFile, tagPosition), null);
        chai_1.assert.deepEqual((yield client.getHover(indexFile, { line: tagPosition.line + 1,
            column: tagPosition.column })).contents, tagDescription);
        yield client.cleanup();
    }));
    test('it supports getting an attribute description', () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner, converter } = yield util_1.createTestEnvironment({ fixtureDir });
        const { contents, range } = (yield client.getHover('editor-service/index.html', localAttributePosition));
        chai_1.assert.deepEqual(contents, localAttributeDescription);
        const sourceRange = converter.convertLRangeToP(range, { uri: converter.getUriForLocalPath('editor-service/index.html') });
        chai_1.assert.deepEqual(yield underliner.underline(sourceRange), `
  <behavior-test-elem local-property deeply-inherited-property="foo">
                      ~~~~~~~~~~~~~~`);
        yield client.cleanup();
    }));
    testName = 'it supports getting a description of an attribute ' +
        'defined in a behavior';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner, converter } = yield util_1.createTestEnvironment({ fixtureDir });
        const { contents, range } = (yield client.getHover('editor-service/index.html', deepAttributePosition));
        chai_1.assert.deepEqual(contents, deepAttributeDescription);
        const sourceRange = converter.convertLRangeToP(range, { uri: converter.getUriForLocalPath('editor-service/index.html') });
        chai_1.assert.deepEqual(yield underliner.underline(sourceRange), `
  <behavior-test-elem local-property deeply-inherited-property="foo">
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~`);
        yield client.cleanup();
    }));
    const fooPropUsePosition = { line: 2, column: 16 };
    const internalPropUsePosition = { line: 3, column: 12 };
    test(`Give documentation for properties in databindings.`, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        const path = 'polymer/element-with-databinding.html';
        const uri = client.converter.getUriForLocalPath(path);
        let hover = (yield client.getHover(path, fooPropUsePosition));
        chai_1.assert.deepEqual(hover.contents, 'This is the foo property.');
        chai_1.assert.deepEqual(yield underliner.underline({ range: hover.range, uri }), `
    <div id="{{foo}}"></div>
               ~~~`);
        hover = (yield client.getHover('polymer/element-with-databinding.html', internalPropUsePosition));
        chai_1.assert.deepEqual(hover.contents, 'A private internal prop.');
        chai_1.assert.deepEqual(yield underliner.underline({ range: hover.range, uri }), `
    {{_internal}}
      ~~~~~~~~~`);
        yield client.cleanup();
    }));
});
//# sourceMappingURL=hover-documenter_test.js.map