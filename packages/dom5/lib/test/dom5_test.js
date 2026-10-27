"use strict";
/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const parse5 = require("parse5");
const dom5 = require("../index");
/// <reference path="mocha" />
suite('dom5', () => {
    suite('Parse5 Node Manipulation', () => {
        const docText = `<!DOCTYPE html>` +
            `<div id='A' qux>a1<div bar='b1' bar='b2'>b1</div>a2</div>` +
            `<div bar='b3 b4'>b3 b4</div>` +
            `<!-- comment -->`;
        let doc = parse5.parse(docText);
        setup(() => {
            doc = parse5.parse(docText);
        });
        suite('Node Identity', () => {
            test('isElement', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert(dom5.isElement(divA));
            });
            test('isTextNode', () => {
                const textA1 = doc.childNodes[1].childNodes[1].childNodes[0].childNodes[0];
                chai_1.assert(dom5.isTextNode(textA1));
            });
            test('isCommentNode', () => {
                const commentEnd = doc.childNodes[1].childNodes[1].childNodes.slice(-1)[0];
                chai_1.assert(dom5.isCommentNode(commentEnd));
            });
        });
        suite('getAttribute', () => {
            test('returns null for a non-set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert.equal(dom5.getAttribute(divA, 'foo'), null);
            });
            test('returns the value for a set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert.equal(dom5.getAttribute(divA, 'id'), 'A');
            });
            test('returns the first value for a doubly set attribute', () => {
                const divB = doc.childNodes[1].childNodes[1].childNodes[0].childNodes[1];
                chai_1.assert.equal(dom5.getAttribute(divB, 'bar'), 'b1');
            });
        });
        suite('hasAttribute', () => {
            test('returns false for a non-set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert.equal(dom5.hasAttribute(divA, 'foo'), false);
            });
            test('returns true for a set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert.equal(dom5.hasAttribute(divA, 'id'), true);
            });
            test('returns true for a doubly set attribute', () => {
                const divB = doc.childNodes[1].childNodes[1].childNodes[0].childNodes[1];
                chai_1.assert.equal(dom5.hasAttribute(divB, 'bar'), true);
            });
            test('returns true for attribute with no value', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert.equal(dom5.hasAttribute(divA, 'qux'), true);
            });
        });
        suite('setAttribute', () => {
            test('sets a non-set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                dom5.setAttribute(divA, 'foo', 'bar');
                chai_1.assert.equal(dom5.getAttribute(divA, 'foo'), 'bar');
            });
            test('sets and already set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                dom5.setAttribute(divA, 'id', 'qux');
                chai_1.assert.equal(dom5.getAttribute(divA, 'id'), 'qux');
            });
            test('sets the first value for a doubly set attribute', () => {
                const divB = doc.childNodes[1].childNodes[1].childNodes[0].childNodes[1];
                dom5.setAttribute(divB, 'bar', 'baz');
                chai_1.assert.equal(dom5.getAttribute(divB, 'bar'), 'baz');
            });
            test('throws when called on a text node', () => {
                const text = doc.childNodes[1].childNodes[1].childNodes[0].childNodes[0];
                chai_1.assert.throws(() => {
                    dom5.setAttribute(text, 'bar', 'baz');
                });
            });
        });
        suite('removeAttribute', () => {
            test('removes a set attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                dom5.removeAttribute(divA, 'foo');
                chai_1.assert.equal(dom5.getAttribute(divA, 'foo'), null);
            });
            test('does not throw when called on a node without that attribute', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                chai_1.assert.doesNotThrow(() => {
                    dom5.removeAttribute(divA, 'ZZZ');
                });
            });
        });
        suite('getTextContent', () => {
            let body = doc.childNodes[1].childNodes[1];
            suiteSetup(() => {
                body = doc.childNodes[1].childNodes[1];
            });
            test('text node', () => {
                const node = body.childNodes[0].childNodes[0];
                const expected = 'a1';
                const actual = dom5.getTextContent(node);
                chai_1.assert.equal(actual, expected);
            });
            test('comment node', () => {
                const node = body.childNodes.slice(-1)[0];
                const expected = ' comment ';
                const actual = dom5.getTextContent(node);
                chai_1.assert.equal(actual, expected);
            });
            test('leaf element', () => {
                const node = body.childNodes[0].childNodes[1];
                const expected = 'b1';
                const actual = dom5.getTextContent(node);
                chai_1.assert.equal(actual, expected);
            });
            test('recursive element', () => {
                const expected = 'a1b1a2b3 b4';
                const actual = dom5.getTextContent(body);
                chai_1.assert.equal(actual, expected);
            });
        });
        suite('setTextContent', () => {
            let body;
            const expected = 'test';
            suiteSetup(() => {
                body = doc.childNodes[1].childNodes[1];
            });
            test('text node', () => {
                const node = body.childNodes[0].childNodes[0];
                dom5.setTextContent(node, expected);
                const actual = dom5.getTextContent(node);
                chai_1.assert.equal(actual, expected);
            });
            test('comment node', () => {
                const node = body.childNodes.slice(-1)[0];
                dom5.setTextContent(node, expected);
                const actual = dom5.getTextContent(node);
                chai_1.assert.equal(actual, expected);
            });
            test('leaf element', () => {
                const node = body.childNodes[0].childNodes[1];
                dom5.setTextContent(node, expected);
                const actual = dom5.getTextContent(node);
                chai_1.assert.equal(actual, expected);
                chai_1.assert.equal(node.childNodes.length, 1);
            });
            test('recursive element', () => {
                dom5.setTextContent(body, expected);
                const actual = dom5.getTextContent(body);
                chai_1.assert.equal(actual, expected);
                chai_1.assert.equal(body.childNodes.length, 1);
            });
        });
        suite('Replace node', () => {
            test('New node replaces old node', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                const newNode = dom5.constructors.element('ul');
                dom5.replace(divA, newNode);
                chai_1.assert.equal(divA.parentNode, null);
                chai_1.assert.equal(doc.childNodes[1].childNodes[1].childNodes.indexOf(divA), -1);
                chai_1.assert.equal(doc.childNodes[1].childNodes[1].childNodes.indexOf(newNode), 0);
            });
            test('accepts document fragments', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                const fragment = dom5.constructors.fragment();
                const span = dom5.constructors.element('span');
                const text = dom5.constructors.text('foo');
                fragment.childNodes.push(span);
                fragment.childNodes.push(text);
                dom5.replace(divA, fragment);
                chai_1.assert.equal(divA.parentNode, null);
                chai_1.assert.equal(doc.childNodes[1].childNodes[1].childNodes.indexOf(divA), -1);
                chai_1.assert.equal(doc.childNodes[1].childNodes[1].childNodes.indexOf(span), 0);
                chai_1.assert.equal(doc.childNodes[1].childNodes[1].childNodes.indexOf(text), 1);
            });
        });
        suite('Remove node', () => {
            test('node is removed from parentNode', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                const parent = divA.parentNode;
                dom5.remove(divA);
                chai_1.assert.equal(divA.parentNode, null);
                chai_1.assert.equal(parent.childNodes.indexOf(divA), -1);
            });
            test('removed nodes do not throw', () => {
                const divA = doc.childNodes[1].childNodes[1].childNodes[0];
                dom5.remove(divA);
                dom5.remove(divA);
                chai_1.assert.equal(divA.parentNode, null);
            });
        });
        suite('Remove node, save children', () => {
            test('node is removed and children at same position', () => {
                const html = '<div><em>x</em><span><em>a</em><em>c</em></span>y</div>';
                const ast = parse5.parseFragment(html);
                const span = ast.childNodes[0].childNodes[1];
                dom5.removeNodeSaveChildren(span);
                chai_1.assert.deepEqual(parse5.serialize(ast), '<div><em>x</em><em>a</em><em>c</em>y</div>');
            });
        });
        suite('Remove fake root elements from tree', () => {
            test('Fake root elements will be removed', () => {
                const html = `<div>Just a div</div>`;
                const ast = parse5.parse(html, { locationInfo: true });
                chai_1.assert.deepEqual(parse5.serialize(ast), '<html><head></head><body><div>Just a div</div></body></html>');
                dom5.removeFakeRootElements(ast);
                chai_1.assert.deepEqual(parse5.serialize(ast), html);
            });
            test('Real root elements will be preserved', () => {
                const html = '<html><head></head><body><div>Just a div</div></body></html>';
                const ast = parse5.parse(html, { locationInfo: true });
                chai_1.assert.deepEqual(parse5.serialize(ast), html);
                dom5.removeFakeRootElements(ast);
                chai_1.assert.deepEqual(parse5.serialize(ast), html);
            });
        });
        suite('Append Node', () => {
            let dom, div, span;
            setup(() => {
                dom = parse5.parseFragment('<div>a</div><span></span>b');
                div = dom.childNodes[0];
                span = dom.childNodes[1];
            });
            test('node is only in one parent', () => {
                const b = dom.childNodes.slice(-1)[0];
                dom5.append(span, b);
                chai_1.assert.equal(b.parentNode, span);
                chai_1.assert.equal(dom.childNodes.indexOf(b), -1);
            });
            test('node is appended to the end of childNodes', () => {
                let bidx = dom.childNodes.length - 1;
                const b = dom.childNodes[bidx];
                dom5.append(div, b);
                bidx = div.childNodes.length - 1;
                chai_1.assert.equal(div.childNodes[bidx], b);
            });
            test('a node that is appended to its current parent is reordered', () => {
                const bidx = dom.childNodes.length - 1;
                const b = dom.childNodes[bidx];
                const a = div.childNodes[0];
                dom5.append(div, b);
                dom5.append(div, a);
                chai_1.assert.equal(div.childNodes[0], b);
                chai_1.assert.equal(div.childNodes[1], a);
            });
            test('accepts document fragments', () => {
                const fragment = dom5.constructors.fragment();
                const span = dom5.constructors.element('span');
                const text = dom5.constructors.text('foo');
                // hold a reference to make sure append() clears childNodes
                const fragmentChildren = fragment.childNodes;
                fragmentChildren.push(span);
                fragmentChildren.push(text);
                dom5.append(div, fragment);
                chai_1.assert.equal(div.childNodes.indexOf(span), 1);
                chai_1.assert.equal(div.childNodes.indexOf(text), 2);
                chai_1.assert.equal(fragment.childNodes.length, 0);
                chai_1.assert.equal(fragmentChildren.length, 0);
            });
            test('append to node with no children', () => {
                const emptyBody = parse5.parse('<head></head><body></body>');
                const body = emptyBody.childNodes[0].childNodes[1];
                const span = dom5.constructors.element('span');
                dom5.append(body, span);
                chai_1.assert.equal(body.childNodes.length, 1);
            });
        });
        suite('InsertBefore', () => {
            let dom, div, span, text;
            setup(() => {
                dom = parse5.parseFragment('<div></div><span></span>text');
                div = dom.childNodes[0];
                span = dom.childNodes[1];
                text = dom.childNodes[2];
            });
            test('ordering is correct', () => {
                dom5.insertBefore(dom, span, text);
                chai_1.assert.equal(dom.childNodes.indexOf(text), 1);
                const newHtml = parse5.serialize(dom);
                chai_1.assert.equal(newHtml, '<div></div>text<span></span>');
                dom5.insertBefore(dom, div, text);
                chai_1.assert.equal(dom.childNodes.indexOf(text), 0);
            });
            test('accepts document fragments', () => {
                const fragment = dom5.constructors.fragment();
                const span2 = dom5.constructors.element('span');
                const text2 = dom5.constructors.text('foo');
                fragment.childNodes.push(span2);
                fragment.childNodes.push(text2);
                dom5.insertBefore(dom, span, fragment);
                chai_1.assert.equal(dom.childNodes.indexOf(span2), 1);
                chai_1.assert.equal(dom.childNodes.indexOf(text2), 2);
                chai_1.assert.equal(dom.childNodes.indexOf(span), 3);
                chai_1.assert.equal(dom.childNodes.indexOf(text), 4);
                chai_1.assert.equal(fragment.childNodes.length, 0);
            });
        });
        suite('insertAfter', () => {
            let dom;
            let div;
            let span;
            let text;
            setup(() => {
                dom = parse5.parseFragment('<div></div><span></span>text');
                [div, span, text] = dom.childNodes;
            });
            test('ordering is correct', () => {
                dom5.insertAfter(dom, div, text);
                chai_1.assert.equal(parse5.serialize(dom), '<div></div>text<span></span>');
                dom5.insertAfter(dom, span, text);
                chai_1.assert.equal(parse5.serialize(dom), '<div></div><span></span>text');
            });
            test('accepts document fragments', () => {
                const fragment = parse5.parseFragment('<span></span>foo');
                dom5.insertAfter(dom, span, fragment);
                chai_1.assert.equal(parse5.serialize(dom), '<div></div><span></span><span></span>footext');
                chai_1.assert.equal(fragment.childNodes.length, 0);
            });
        });
        suite('cloneNode', () => {
            test('clones a node', () => {
                const dom = parse5.parseFragment('<div><span foo="bar">a</span></div>');
                const div = dom.childNodes[0];
                const span = div.childNodes[0];
                const clone = dom5.cloneNode(span);
                chai_1.assert.equal(clone.parentNode, null);
                chai_1.assert.equal(span.parentNode, div);
                chai_1.assert.equal(clone.tagName, 'span');
                chai_1.assert.equal(dom5.getAttribute(clone, 'foo'), 'bar');
                chai_1.assert.equal(clone.childNodes[0].nodeName, '#text');
                chai_1.assert.equal(clone.childNodes[0].value, 'a');
                chai_1.assert.equal(span.childNodes[0].nodeName, '#text');
                chai_1.assert.equal(span.childNodes[0].value, 'a');
                chai_1.assert.notStrictEqual(clone.childNodes[0], span.childNodes[0]);
            });
        });
    });
    suite('Query Predicates', () => {
        const fragText = '<div id="a" class="b c"><!-- nametag -->Hello World</div>';
        let frag;
        suiteSetup(() => {
            frag = parse5.parseFragment(fragText).childNodes[0];
        });
        test('hasTagName', () => {
            let fn = dom5.predicates.hasTagName('div');
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasTagName('a');
            chai_1.assert.isFalse(fn(frag));
        });
        test('hasAttr', () => {
            let fn = dom5.predicates.hasAttr('id');
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasAttr('class');
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasAttr('hidden');
            chai_1.assert.isFalse(fn(frag));
        });
        test('hasAttrValue', () => {
            let fn = dom5.predicates.hasAttrValue('id', 'a');
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasAttrValue('class', 'b c');
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasAttrValue('id', 'b');
            chai_1.assert.isFalse(fn(frag));
            fn = dom5.predicates.hasAttrValue('name', 'b');
            chai_1.assert.isFalse(fn(frag));
        });
        test('hasSpaceSeparatedAttrValue', () => {
            let fn = dom5.predicates.hasSpaceSeparatedAttrValue('class', 'c');
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasAttr('class');
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasSpaceSeparatedAttrValue('id', '');
            chai_1.assert.isFalse(fn(frag));
        });
        test('hasClass', () => {
            let fn = dom5.predicates.hasClass('b');
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasClass('c');
            chai_1.assert.isTrue(fn(frag));
            fn = dom5.predicates.hasClass('d');
            chai_1.assert.isFalse(fn(frag));
        });
        test('hasTextValue', () => {
            let fn = dom5.predicates.hasTextValue('Hello World');
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            const textNode = frag.childNodes[1];
            chai_1.assert.isTrue(fn(textNode));
            const commentNode = frag.childNodes[0];
            fn = dom5.predicates.hasTextValue(' nametag ');
            chai_1.assert.isTrue(fn(commentNode));
        });
        test('AND', () => {
            const preds = [
                dom5.predicates.hasTagName('div'),
                dom5.predicates.hasAttrValue('id', 'a'),
                dom5.predicates.hasClass('b')
            ];
            let fn = dom5.predicates.AND.apply(null, preds);
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            preds.push(dom5.predicates.hasClass('d'));
            fn = dom5.predicates.AND.apply(null, preds);
            chai_1.assert.isFalse(fn(frag));
        });
        test('OR', () => {
            const preds = [
                dom5.predicates.hasTagName('div'),
                dom5.predicates.hasAttr('hidden')
            ];
            let fn = dom5.predicates.OR.apply(null, preds);
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            preds.shift();
            fn = dom5.predicates.OR.apply(null, preds);
            chai_1.assert.isFalse(fn(frag));
        });
        test('NOT', () => {
            const pred = dom5.predicates.hasTagName('a');
            const fn = dom5.predicates.NOT(pred);
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
            chai_1.assert.isFalse(pred(frag));
        });
        test('Chaining Predicates', () => {
            const fn = dom5.predicates.AND(dom5.predicates.hasTagName('div'), dom5.predicates.OR(dom5.predicates.hasClass('b'), dom5.predicates.hasClass('d')), dom5.predicates.NOT(dom5.predicates.hasAttr('hidden')));
            chai_1.assert.isFunction(fn);
            chai_1.assert.isTrue(fn(frag));
        });
        test('parentMatches', () => {
            const fragText = '<div class="a"><div class="b"><div class="c"></div></div></div>';
            const frag = parse5.parseFragment(fragText);
            const fn = dom5.predicates.parentMatches(dom5.predicates.hasClass('a'));
            chai_1.assert.isFalse(fn(frag.childNodes[0])); // a
            chai_1.assert.isTrue(fn(frag.childNodes[0].childNodes[0])); // b
            chai_1.assert.isTrue(fn(frag.childNodes[0].childNodes[0].childNodes[0])); // c
        });
    });
    suite('Constructors', () => {
        test('text node', () => {
            const node = dom5.constructors.text('test');
            chai_1.assert.isTrue(dom5.isTextNode(node));
            const fn = dom5.predicates.hasTextValue('test');
            chai_1.assert.equal(dom5.nodeWalk(node, fn), node);
        });
        test('comment node', () => {
            const node = dom5.constructors.comment('test');
            chai_1.assert.isTrue(dom5.isCommentNode(node));
            const fn = dom5.predicates.hasTextValue('test');
            chai_1.assert.equal(dom5.nodeWalk(node, fn), node);
        });
        test('element', () => {
            const node = dom5.constructors.element('div');
            chai_1.assert.isTrue(dom5.isElement(node));
            const fn = dom5.predicates.hasTagName('div');
            chai_1.assert.equal(dom5.query(node, fn), node);
        });
    });
    suite('Text Normalization', () => {
        const con = dom5.constructors;
        test('normalizing text nodes or comment nodes is a noop', () => {
            const tn = con.text('test');
            const cn = con.comment('test2');
            dom5.normalize(tn);
            dom5.normalize(cn);
            chai_1.assert.equal(tn, tn);
            chai_1.assert.equal(cn, cn);
        });
        test('an element\'s child text nodes are merged', () => {
            const div = con.element('div');
            const tn1 = con.text('foo');
            const tn2 = con.text('bar');
            dom5.append(div, tn1);
            dom5.append(div, tn2);
            const expected = dom5.getTextContent(div);
            chai_1.assert.equal(expected, 'foobar');
            dom5.normalize(div);
            const actual = dom5.getTextContent(div);
            chai_1.assert.equal(actual, expected);
            chai_1.assert.equal(div.childNodes.length, 1);
        });
        test('only text node ranges are merged', () => {
            const div = con.element('div');
            const tn1 = con.text('foo');
            const tn2 = con.text('bar');
            const cn = con.comment('combobreaker');
            const tn3 = con.text('quux');
            dom5.append(div, tn1);
            dom5.append(div, tn2);
            dom5.append(div, cn);
            dom5.append(div, tn3);
            const expected = dom5.getTextContent(div);
            chai_1.assert.equal(expected, 'foobarquux');
            dom5.normalize(div);
            const actual = dom5.getTextContent(div);
            chai_1.assert.equal(actual, expected);
            chai_1.assert.equal(div.childNodes.length, 3);
            chai_1.assert.equal(dom5.getTextContent(div.childNodes[0]), 'foobar');
            chai_1.assert.equal(dom5.getTextContent(div.childNodes[1]), 'combobreaker');
            chai_1.assert.equal(dom5.getTextContent(div.childNodes[2]), 'quux');
        });
        test('empty text nodes are removed', () => {
            const div = con.element('div');
            const tn = con.text('');
            dom5.append(div, tn);
            chai_1.assert.equal(div.childNodes.length, 1);
            dom5.normalize(div);
            chai_1.assert.equal(div.childNodes.length, 0);
        });
        test('elements are recursively normalized', () => {
            const div = con.element('div');
            const tn1 = con.text('foo');
            const space = con.text('');
            dom5.append(div, tn1);
            dom5.append(div, space);
            const span = con.element('span');
            const tn2 = con.text('bar');
            const tn3 = con.text('baz');
            dom5.append(span, tn2);
            dom5.append(span, tn3);
            dom5.append(div, span);
            chai_1.assert.equal(dom5.getTextContent(div), 'foobarbaz');
            dom5.normalize(div);
            chai_1.assert.equal(div.childNodes.length, 2);
            chai_1.assert.equal(span.childNodes.length, 1);
        });
        test('document can be normalized', () => {
            const doc = parse5.parse('<!DOCTYPE html>');
            const body = doc.childNodes[1].childNodes[1];
            const div = con.element('div');
            const tn1 = con.text('foo');
            const space = con.text('');
            dom5.append(div, tn1);
            dom5.append(div, space);
            const span = con.element('span');
            const tn2 = con.text('bar');
            const tn3 = con.text('baz');
            dom5.append(span, tn2);
            dom5.append(span, tn3);
            dom5.append(div, span);
            dom5.append(body, div);
            chai_1.assert.equal(dom5.getTextContent(doc), 'foobarbaz');
            dom5.normalize(doc);
            chai_1.assert.equal(dom5.getTextContent(doc), 'foobarbaz');
            chai_1.assert.equal(div.childNodes.length, 2);
            chai_1.assert.equal(span.childNodes.length, 1);
        });
    });
});
//# sourceMappingURL=dom5_test.js.map