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
const clone = require("clone");
const fs_1 = require("fs");
const path = require("path");
const main_1 = require("vscode-languageserver/lib/main");
const standard_snippets_1 = require("../standard-snippets");
const util_1 = require("./util");
const fixtureDir = path.join(__dirname, '..', '..', 'src', 'test', 'static');
const elementCompletions = [
    {
        documentation: {
            kind: 'markdown',
            value: 'An element to test out behavior inheritance.'
        },
        insertText: '<behavior-test-elem $1></behavior-test-elem>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<behavior-test-elem>',
        filterText: 'behaviortestelem',
    },
    {
        documentation: { kind: 'markdown', value: '' },
        insertText: '<class-declaration></class-declaration>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<class-declaration>',
        filterText: 'classdeclaration',
    },
    {
        documentation: { kind: 'markdown', value: '' },
        insertText: '<anonymous-class></anonymous-class>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<anonymous-class>',
        filterText: 'anonymousclass',
    },
    {
        documentation: { kind: 'markdown', value: '' },
        insertText: '<class-expression></class-expression>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<class-expression>',
        filterText: 'classexpression',
    },
    {
        documentation: { kind: 'markdown', value: '' },
        insertText: '<register-before-declaration></register-before-declaration>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<register-before-declaration>',
        filterText: 'registerbeforedeclaration',
    },
    {
        documentation: { kind: 'markdown', value: '' },
        insertText: '<register-before-expression></register-before-expression>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<register-before-expression>',
        filterText: 'registerbeforeexpression',
    },
    {
        documentation: {
            kind: 'markdown',
            value: 'This is a description of WithObservedAttributes.'
        },
        insertText: '<vanilla-with-observed-attributes $1>' +
            '</vanilla-with-observed-attributes>$0',
        insertTextFormat: main_1.InsertTextFormat.Snippet,
        kind: main_1.CompletionItemKind.Class,
        label: '<vanilla-with-observed-attributes>',
        filterText: 'vanillawithobservedattributes',
    },
];
// Like elementCompletions, but without leading `<` characters.
const elementTagnameCompletions = elementCompletions.map((ec) => {
    return Object.assign({}, ec, { insertText: ec.insertText.slice(1) });
});
const elementCompletionsWithPlainDescriptions = elementCompletions.map((ec) => {
    return Object.assign({}, ec, { documentation: ec.documentation.value });
});
const attributeCompletions = [
    {
        label: 'local-property',
        documentation: {
            kind: 'markdown',
            value: 'A property defined directly on behavior-test-elem.',
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{boolean | null | undefined}',
        sortText: 'aaa-local-property',
    },
    {
        label: 'non-notifying-property',
        documentation: { kind: 'markdown', value: '' },
        kind: main_1.CompletionItemKind.Field,
        detail: '{string | null | undefined}',
        sortText: 'aaa-non-notifying-property',
    },
    {
        label: 'notifying-property',
        documentation: { kind: 'markdown', value: '' },
        kind: main_1.CompletionItemKind.Field,
        detail: '{string | null | undefined}',
        sortText: 'aaa-notifying-property',
    },
    {
        label: 'deeply-inherited-property',
        documentation: {
            kind: 'markdown',
            value: 'This is a deeply inherited property.',
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{Array | null | undefined} ⊃ MyNamespace.SubBehavior',
        sortText: 'ddd-deeply-inherited-property',
    },
    {
        label: 'inherit-please',
        documentation: {
            kind: 'markdown',
            value: 'A property provided by SimpleBehavior.',
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{number | null | undefined} ⊃ MyNamespace.SimpleBehavior',
        sortText: 'ddd-inherit-please',
    },
    {
        label: 'on-local-property-changed',
        documentation: {
            kind: 'markdown',
            value: 'Fired when the `localProperty` property changes.'
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{CustomEvent}',
        sortText: 'eee-aaa-on-local-property-changed',
    },
    {
        label: 'on-notifying-property-changed',
        documentation: {
            kind: 'markdown',
            value: 'Fired when the `notifyingProperty` property changes.'
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{CustomEvent}',
        sortText: 'eee-aaa-on-notifying-property-changed',
    },
    {
        label: 'on-deeply-inherited-property-changed',
        documentation: {
            kind: 'markdown',
            value: 'Fired when the `deeplyInheritedProperty` property changes.'
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{CustomEvent} ⊃ MyNamespace.SubBehavior',
        sortText: 'eee-ddd-on-deeply-inherited-property-changed',
    },
    {
        label: 'on-inherit-please-changed',
        documentation: {
            kind: 'markdown',
            value: 'Fired when the `inheritPlease` property changes.'
        },
        kind: main_1.CompletionItemKind.Field,
        detail: '{CustomEvent} ⊃ MyNamespace.SimpleBehavior',
        sortText: 'eee-ddd-on-inherit-please-changed',
    },
];
suite('AutoCompleter', () => {
    const indexFile = path.join('editor-service', 'index.html');
    const indexContents = fs_1.readFileSync(path.join(fixtureDir, indexFile), 'utf-8');
    const tagPosition = { line: 7, column: 9 };
    const tagPositionEnd = { line: 7, column: 21 };
    const localAttributePosition = { line: 7, column: 31 };
    test('Get element completions for an empty text region', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        const completions = yield client.getCompletions(indexFile, { line: 0, column: 0 });
        chai_1.assert.deepEqual(completions, { isIncomplete: false, items: elementCompletions });
        yield client.cleanup();
    }));
    let testName = `Doesn't send down markdown if the client doesn't support it`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const capabilities = clone(util_1.defaultClientCapabilities);
        capabilities.textDocument.completion.completionItem = Object.assign({}, (capabilities.textDocument.completion.completionItem), { documentationFormat: undefined });
        const { client } = yield util_1.createTestEnvironment({ fixtureDir, capabilities });
        yield client.openFile(indexFile);
        const completions = yield client.getCompletions(indexFile, { line: 0, column: 0 });
        chai_1.assert.deepEqual(completions, { isIncomplete: false, items: elementCompletionsWithPlainDescriptions });
    }));
    test('Get element completions for a start tag', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        const completions = yield client.getCompletions(indexFile, tagPosition);
        chai_1.assert.deepEqual(completions, { isIncomplete: false, items: elementTagnameCompletions });
        yield client.cleanup();
    }));
    test('Gets element completions with an incomplete tag', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        const incompleteText = `<behav>\n${indexContents}`;
        yield client.changeFile(indexFile, incompleteText);
        chai_1.assert.deepEqual(yield client.getCompletions(indexFile, { line: 0, column: incompleteText.length - 2 }), { isIncomplete: false, items: elementCompletions });
        yield client.cleanup();
    }));
    test('Get element completions for the end of a tag', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        chai_1.assert.deepEqual(yield client.getCompletions(indexFile, tagPositionEnd), { isIncomplete: false, items: elementTagnameCompletions });
        yield client.cleanup();
    }));
    testName = 'Get attribute completions when editing an existing attribute';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        chai_1.assert.deepEqual(yield client.getCompletions(indexFile, localAttributePosition), { isIncomplete: false, items: attributeCompletions });
        yield client.cleanup();
    }));
    test('Get attribute completions when adding a new attribute', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        const partialContents = [
            `<behavior-test-elem >`,
            `<behavior-test-elem existing-attr>`,
            `<behavior-test-elem existing-attr></behavior-test-elem>`,
            `<behavior-test-elem existing-attr></wrong-closing-tag>`
        ];
        for (const partial of partialContents) {
            yield client.changeFile(indexFile, `${partial}\n${indexContents}`);
            chai_1.assert.deepEqual(yield client.getCompletions(indexFile, {
                line: 0,
                column: 20 // after the space after the element
                // name
            }), { isIncomplete: false, items: attributeCompletions });
        }
        yield client.cleanup();
    }));
    test('Get attribute completions when adding a new attribute', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        const partialContents = [
            `<behavior-test-elem >`,
            `<behavior-test-elem existing-attr>`,
            `<behavior-test-elem existing-attr></behavior-test-elem>`,
            `<behavior-test-elem existing-attr></wrong-closing-tag>`
        ];
        for (const partial of partialContents) {
            yield client.changeFile(indexFile, `${partial}\n${indexContents}`);
            chai_1.assert.deepEqual(yield client.getCompletions(indexFile, {
                line: 0,
                column: 20 // after the space after the element
                // name
            }), { isIncomplete: false, items: attributeCompletions });
        }
        yield client.cleanup();
    }));
    testName = 'Get attribute value completions for non-notifying property';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const testFile = path.join('editor-service', 'value-completion.html');
        const testContents = fs_1.readFileSync(path.join(fixtureDir, testFile), 'utf-8');
        yield client.openFile(testFile, testContents);
        chai_1.assert.deepEqual(yield client.getCompletions(testFile, {
            line: 4,
            column: 49 // inside the quotes
        }), {
            isIncomplete: false,
            items: [
                {
                    label: 'bar',
                    insertText: '[[bar]]',
                    documentation: { kind: 'markdown', value: '' },
                    sortText: 'aaa-bar',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field,
                },
                {
                    label: 'foo',
                    insertText: '[[foo]]',
                    documentation: { kind: 'markdown', value: '' },
                    sortText: 'aaa-foo',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field,
                },
            ],
        });
        // There's an invalid expression in this source file, but that's ok.
        chai_1.assert.deepEqual((yield client.getNextDiagnostics(testFile)).map((d) => d.code), ['invalid-polymer-expression']);
        yield client.cleanup();
    }));
    test('Get attribute value completions for notifying property', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const testFile = path.join('editor-service', 'value-completion.html');
        const testContents = fs_1.readFileSync(path.join(fixtureDir, testFile), 'utf-8');
        yield client.openFile(testFile, testContents);
        chai_1.assert.deepEqual(yield client.getCompletions(testFile, {
            line: 4,
            column: 71 // after the space after the element name
        }), {
            isIncomplete: false,
            items: [
                {
                    insertText: '{{bar}}',
                    documentation: { kind: 'markdown', value: '' },
                    label: 'bar',
                    sortText: 'aaa-bar',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field,
                },
                {
                    insertText: '{{foo}}',
                    documentation: { kind: 'markdown', value: '' },
                    label: 'foo',
                    sortText: 'aaa-foo',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field,
                },
            ],
        });
        // There's an invalid expression in this source file, but that's ok.
        chai_1.assert.deepEqual((yield client.getNextDiagnostics(testFile)).map((d) => d.code), ['invalid-polymer-expression']);
        yield client.cleanup();
    }));
    testName =
        'Get attribute value completions for notifying property without brackets';
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const testFile = path.join('editor-service', 'value-completion.html');
        const testContents = fs_1.readFileSync(path.join(fixtureDir, testFile), 'utf-8');
        yield client.openFile(testFile, testContents);
        chai_1.assert.deepEqual(yield client.getCompletions(testFile, {
            line: 4,
            column: 91 // after the space after the element name
        }), {
            isIncomplete: false,
            items: [
                {
                    insertText: 'bar',
                    documentation: { kind: 'markdown', value: '' },
                    label: 'bar',
                    sortText: 'aaa-bar',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field,
                },
                {
                    insertText: 'foo',
                    documentation: { kind: 'markdown', value: '' },
                    label: 'foo',
                    sortText: 'aaa-foo',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field,
                },
            ],
        });
        // There's an invalid expression in this source file, but that's ok.
        chai_1.assert.deepEqual((yield client.getNextDiagnostics(testFile)).map((d) => d.code), ['invalid-polymer-expression']);
        yield client.cleanup();
    }));
    test('Inserts slots in autocompletion snippet', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const slotFile = path.join('editor-service', 'slot.html');
        yield client.openFile(slotFile, fs_1.readFileSync(path.join(fixtureDir, slotFile), 'utf-8'));
        chai_1.assert.deepEqual(yield client.getCompletions(slotFile, {
            line: 1,
            column: 0 // after the space after the element name
        }), {
            isIncomplete: false,
            items: [
                {
                    label: '<slot-test-elem>',
                    insertText: '<slot-test-elem>\n' +
                        '\t<$\{1:div\} slot="slot1">$2</$\{1:div\}>\n' +
                        '\t<$\{3:div\} slot="slot2">$4</$\{3:div\}>\n' +
                        '\t<$\{5:div\}>$6</$\{5:div\}>\n' +
                        '</slot-test-elem>$0',
                    insertTextFormat: main_1.InsertTextFormat.Snippet,
                    documentation: { kind: 'markdown', value: '' },
                    kind: main_1.CompletionItemKind.Class,
                    filterText: `slottestelem`,
                },
                {
                    label: '<slot-one-test-elem>',
                    insertText: `<slot-one-test-elem>$1</slot-one-test-elem>$0`,
                    insertTextFormat: main_1.InsertTextFormat.Snippet,
                    documentation: { kind: 'markdown', value: '' },
                    kind: main_1.CompletionItemKind.Class,
                    filterText: `slotonetestelem`,
                }
            ],
        });
        yield client.cleanup();
    }));
    test('Recover from references to undefined files', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        // Load a file that contains a reference error.
        yield client.changeFile(indexFile, `${indexContents}
                                     <script src="nonexistant.js"></script>`);
        // We recover after getting a good version of the file.
        yield client.changeFile(indexFile, indexContents);
        chai_1.assert.deepEqual(yield client.getCompletions(indexFile, localAttributePosition), { isIncomplete: false, items: attributeCompletions });
        yield client.cleanup();
    }));
    test('Remain useful in the face of unloadable files', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics(indexFile)).map((d) => d.code), []);
        // We load a file that contains a reference error.
        yield client.changeFile(indexFile, `${indexContents}
                                     <script src="nonexistant.js"></script>`);
        // Harder: can we give typeahead completion when there's
        // errors?'
        chai_1.assert.deepEqual(yield client.getCompletions(indexFile, localAttributePosition), { isIncomplete: false, items: attributeCompletions });
        chai_1.assert.deepEqual((yield client.getNextDiagnostics(indexFile)).map((d) => d.code), ['could-not-load']);
        yield client.cleanup();
    }));
    test('Remain useful in the face of syntax errors', () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        const goodContents = fs_1.readFileSync(path.join(fixtureDir, indexFile), 'utf-8');
        // Load a file with a syntax error
        yield client.openFile('syntax-error.js', 'var var var var var var var var “hello”');
        yield client.openFile(indexFile, `${goodContents}
                                    <script src="./syntax-error.js"></script>`);
        // Even with a reference to the bad file we can still
        // get completions!
        chai_1.assert.deepEqual(yield client.getCompletions(indexFile, localAttributePosition), { isIncomplete: false, items: attributeCompletions });
        // Consume diagnostics that are reported.
        chai_1.assert.deepEqual((yield client.getNextDiagnostics(indexFile)).map((d) => d.code), ['could-not-load']);
        // We get this one twice, once when the file is opened, and again when
        // indexFile is modified.
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('syntax-error.js')).map((d) => d.code), ['parse-error']);
        chai_1.assert.deepEqual((yield client.getNextDiagnostics('syntax-error.js')).map((d) => d.code), ['parse-error']);
        yield client.cleanup();
    }));
    testName = `Return JavaScript standard completions inside of script tags`;
    test(testName, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment({ fixtureDir });
        yield client.openFile(indexFile, '<script>\n\n</script>\n' + indexContents);
        const completions = yield client.getCompletions(indexFile, { line: 1, column: 0 });
        chai_1.assert.deepEqual(completions, { isIncomplete: false, items: standard_snippets_1.standardJavaScriptSnippets });
    }));
    {
        const fooPropUsePosition = { line: 2, column: 16 };
        const internalPropUsePosition = { line: 3, column: 12 };
        const databindingCompletions = {
            isIncomplete: false,
            items: [
                {
                    documentation: { kind: 'markdown', value: 'A private internal prop.' },
                    label: '_internal',
                    sortText: 'aaa-_internal',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field
                },
                {
                    documentation: { kind: 'markdown', value: 'This is the foo property.' },
                    label: 'foo',
                    sortText: 'aaa-foo',
                    detail: '{string | null | undefined}',
                    kind: main_1.CompletionItemKind.Field
                },
            ]
        };
        test('Give autocompletions for positions in databindings', () => __awaiter(this, void 0, void 0, function* () {
            const { client } = yield util_1.createTestEnvironment({ fixtureDir });
            chai_1.assert.deepEqual(yield client.getCompletions('polymer/element-with-databinding.html', fooPropUsePosition), databindingCompletions);
            chai_1.assert.deepEqual(yield client.getCompletions('polymer/element-with-databinding.html', internalPropUsePosition), databindingCompletions);
            yield client.cleanup();
        }));
        const customPropertyExample = `
      <style>
        div {
          --foo: red;
          --bar: var(--baz);
          --fizz: {--floo: var(--flub);};
        }
      </style>
    `;
        const declaractionPosition = { line: 3, column: 16 };
        const usePosition = { line: 4, column: 27 };
        test(`autocomplete css custom property declarations`, () => __awaiter(this, void 0, void 0, function* () {
            const { client } = yield util_1.createTestEnvironment();
            yield client.openFile('index.html', customPropertyExample);
            chai_1.assert.deepEqual(yield client.getCompletions('index.html', declaractionPosition), {
                isIncomplete: false,
                items: [
                    { label: '--bar', kind: main_1.CompletionItemKind.Variable },
                    { label: '--baz', kind: main_1.CompletionItemKind.Variable },
                    { label: '--fizz', kind: main_1.CompletionItemKind.Variable },
                    { label: '--floo', kind: main_1.CompletionItemKind.Variable },
                    { label: '--flub', kind: main_1.CompletionItemKind.Variable },
                ]
            });
            yield client.cleanup();
        }));
        test(`autocomplete css custom property uses`, () => __awaiter(this, void 0, void 0, function* () {
            const { client } = yield util_1.createTestEnvironment();
            yield client.openFile('index.html', customPropertyExample);
            chai_1.assert.deepEqual(yield client.getCompletions('index.html', usePosition), {
                isIncomplete: false,
                items: [
                    { label: '--bar', kind: main_1.CompletionItemKind.Variable },
                    { label: '--fizz', kind: main_1.CompletionItemKind.Variable },
                    { label: '--floo', kind: main_1.CompletionItemKind.Variable },
                    { label: '--foo', kind: main_1.CompletionItemKind.Variable },
                ]
            });
            yield client.cleanup();
        }));
    }
    test(`Complete slot names`, () => __awaiter(this, void 0, void 0, function* () {
        const { client } = yield util_1.createTestEnvironment();
        yield client.openFile('index.html', `
      <my-elem>
        <div slot=""></div>
      </my-elem>

      <dom-module id="my-elem">
        <template>
          <slot name="foo"></slot>
          <slot name="bar"></slot>
          <slot></slot>
        </template>
        <script>customElements.define('my-elem', class extends HTMLElement{});
        </script>
      </dom-module>
    `);
        `2,19`;
        chai_1.assert.deepEqual(yield client.getCompletions('index.html', { column: 19, line: 2 }), {
            isIncomplete: false,
            items: [
                { kind: main_1.CompletionItemKind.Variable, label: 'foo' },
                { kind: main_1.CompletionItemKind.Variable, label: 'bar' }
            ]
        });
        yield client.cleanup();
    }));
});
//# sourceMappingURL=auto-completer_test.js.map