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
const fs_1 = require("fs");
const path = require("path");
const util_1 = require("./util");
const fixtureDir = path.join(__dirname, '..', '..', 'src', 'test', 'static');
suite('DefinitionFinder', function () {
    const indexFile = path.join('editor-service', 'index.html');
    const tagPosition = { line: 7, column: 9 };
    const localAttributePosition = { line: 7, column: 31 };
    const deepAttributePosition = { line: 7, column: 49 };
    let testName = `it supports getting the definition of ` +
        `an element from its tag`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        chai_1.assert.deepEqual(yield underliner.underline(yield client.getDefinition(indexFile, tagPosition)), [`
  Polymer({
          ~
    is: 'behavior-test-elem',
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    behaviors: [MyNamespace.SimpleBehavior],
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    properties: {
~~~~~~~~~~~~~~~~~
      /** A property defined directly on behavior-test-elem. */
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      localProperty: {
~~~~~~~~~~~~~~~~~~~~~~
        type: Boolean,
~~~~~~~~~~~~~~~~~~~~~~
        value: true,
~~~~~~~~~~~~~~~~~~~~
        notify: true
~~~~~~~~~~~~~~~~~~~~
      },
~~~~~~~~
      nonNotifyingProperty: {
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        type: String
~~~~~~~~~~~~~~~~~~~~
      },
~~~~~~~~
      notifyingProperty: {
~~~~~~~~~~~~~~~~~~~~~~~~~~
        type: String,
~~~~~~~~~~~~~~~~~~~~~
        notify: true
~~~~~~~~~~~~~~~~~~~~
      },
~~~~~~~~
      /** This is used entirely for internal purposes ok. */
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      _privateProperty: {
~~~~~~~~~~~~~~~~~~~~~~~~~
        type: String,
~~~~~~~~~~~~~~~~~~~~~
        value: 'don\\'t look!'
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
~~~~~~~
    },
~~~~~~


    created: function() {
~~~~~~~~~~~~~~~~~~~~~~~~~
      console.log('created!');
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    }
~~~~~
  });
~~~`]);
        yield client.cleanup();
    }));
    test('it supports getting the definition of a local attribute', () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        chai_1.assert.deepEqual(yield underliner.underline(yield client.getDefinition(indexFile, localAttributePosition)), [`
      localProperty: {
      ~~~~~~~~~~~~~~~~
        type: Boolean,
~~~~~~~~~~~~~~~~~~~~~~
        value: true,
~~~~~~~~~~~~~~~~~~~~
        notify: true
~~~~~~~~~~~~~~~~~~~~
      },
~~~~~~~`]);
        yield client.cleanup();
    }));
    testName = 'it supports getting the definition of an attribute ' +
        'defined in a behavior';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        chai_1.assert.deepEqual(yield underliner.underline(yield client.getDefinition(indexFile, deepAttributePosition)), [`
      deeplyInheritedProperty: {
      ~~~~~~~~~~~~~~~~~~~~~~~~~~
        type: Array,
~~~~~~~~~~~~~~~~~~~~
        value: function() {
~~~~~~~~~~~~~~~~~~~~~~~~~~~
          return [];
~~~~~~~~~~~~~~~~~~~~
        },
~~~~~~~~~~
        notify: true
~~~~~~~~~~~~~~~~~~~~
      }
~~~~~~~`]);
        yield client.cleanup();
    }));
    test('it supports properties in databindings.', () => __awaiter(this, void 0, void 0, function* () {
        const fooPropUsePosition = { line: 2, column: 16 };
        const internalPropUsePosition = { line: 3, column: 12 };
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        let location = (yield client.getDefinition('polymer/element-with-databinding.html', fooPropUsePosition));
        chai_1.assert.deepEqual(yield underliner.underline(location), [`
        foo: String,
        ~~~~~~~~~~~`]);
        location = (yield client.getDefinition('polymer/element-with-databinding.html', internalPropUsePosition));
        chai_1.assert.deepEqual(yield underliner.underline(location), [`
        _internal: String,
        ~~~~~~~~~~~~~~~~~`]);
        yield client.cleanup();
    }));
    testName = `it supports getting references to an element from its tag`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const contentsPath = path.join('editor-service', 'references.html');
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(contentsPath);
        let references = yield client.getReferences(contentsPath, { line: 7, column: 3 });
        let ranges = yield underliner.underline(references);
        chai_1.assert.deepEqual(ranges, [
            `
  <anonymous-class one></anonymous-class>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
  <anonymous-class two></anonymous-class>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
        ]);
        references =
            yield client.getReferences(contentsPath, { line: 7, column: 3 }, true);
        ranges = yield underliner.underline(references);
        chai_1.assert.deepEqual(ranges, [
            `
customElements.define('anonymous-class', class extends HTMLElement{});
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
  <anonymous-class one></anonymous-class>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
  <anonymous-class two></anonymous-class>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
        ]);
        references = yield client.getReferences(contentsPath, { line: 8, column: 3 });
        ranges = yield underliner.underline(references);
        chai_1.assert.deepEqual(ranges, [
            `
  <simple-element one></simple-element>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
    <simple-element two></simple-element>
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
        ]);
        yield client.cleanup();
    }));
    test(`supports getting workspace symbols`, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir: path.join(fixtureDir, 'editor-service') });
        chai_1.assert.deepEqual((yield client.getWorkspaceSymbols('')).map((s) => s.name), [
            'slot-test-elem',
            'slot-one-test-elem',
            'behavior-user',
        ]);
        chai_1.assert.deepEqual((yield client.getWorkspaceSymbols('one')).map((s) => s.name), [
            'slot-one-test-elem',
        ]);
        yield client.cleanup();
    }));
    test(`supports getting document symbols`, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir: path.join(fixtureDir, 'editor-service') });
        chai_1.assert.deepEqual((yield client.getDocumentSymbols('slot-test-elem.html')).map((s) => s.name), [
            'slot-test-elem',
            'slot-one-test-elem',
        ]);
        chai_1.assert.deepEqual((yield client.getWorkspaceSymbols('slot.html')).map((s) => s.name), []);
        yield client.cleanup();
    }));
    testName =
        `it supports finding definitions and references of a css custom property`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client, underliner } = yield util_1.createTestEnvironment({ fixtureDir: path.join(fixtureDir, 'css-custom-properties') });
        const locations = yield client.getDefinition('main.html', { line: 5, column: 20 });
        chai_1.assert.deepEqual(yield underliner.underline(locations), [
            `
    --shiny: green;
    ~~~~~~~`,
            `
    --shiny: gold;
    ~~~~~~~`
        ]);
        chai_1.assert.deepEqual(yield underliner.underline(yield client.getReferences('main.html', { line: 5, column: 20 })), [
            `
    color: var(--shiny);
               ~~~~~~~`,
            `
    @apply --shiny;
           ~~~~~~~`
        ]);
        yield client.cleanup();
    }));
    testName = `it supports getting code lenses of custom property declarations`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir: path.join(fixtureDir, 'css-custom-properties') });
        yield client.changeConfiguration({ referencesCodeLens: false });
        chai_1.assert.deepEqual((yield client.getCodeLenses('lib.html')).map((c) => c.command.title), []);
        yield client.changeConfiguration({ referencesCodeLens: true });
        chai_1.assert.deepEqual((yield client.getCodeLenses('lib.html')).map((c) => c.command.title), [`Read 2 places.`, `Read 1 place.`, `Read 2 places.`]);
        yield client.cleanup();
    }));
    test(`it supports getting code lenses of elements`, () => __awaiter(this, void 0, void 0, function* () {
        const { client, baseDir } = yield util_1.createTestEnvironment();
        // TODO(rictic): this test should work with entirely in-memory contents,
        //     but we need to mess with InMemoryOverlayUrlLoader's listDirectory
        //     method to be sure it includes entirely in-memory files.
        fs_1.writeFileSync(path.join(baseDir, 'index.html'), `
      <script>
        customElements.define('foo-bar', class extends HTMLElement{});
      </script>
      <foo-bar><foo-bar></foo-bar></foo-bar>

      <foo-bar><baz-bonk></baz-bonk></foo-bar>
      <script>
        customElements.define('baz-bonk', class extends HTMLElement{});
      </script>
    `);
        yield client.changeConfiguration({ referencesCodeLens: false });
        chai_1.assert.deepEqual((yield client.getCodeLenses('index.html')).map((c) => c.command.title), []);
        yield client.changeConfiguration({ referencesCodeLens: true });
        chai_1.assert.deepEqual((yield client.getCodeLenses('index.html')).map((c) => c.command.title), [`Referenced 3 places in HTML.`, `Referenced 1 place in HTML.`]);
        yield client.cleanup();
    }));
});
//# sourceMappingURL=definition-finder_test.js.map