"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const astTypes = require("ast-types");
const dom5 = require("dom5");
const ix_1 = require("ix");
const jsc = require("jscodeshift");
const os_1 = require("os");
const parse5 = require("parse5");
const util_1 = require("./util");
/**
 * Serialize a parse5 Node to a string.
 */
function serializeNode(node) {
    const container = parse5.treeAdapters.default.createDocumentFragment();
    dom5.append(container, node);
    return parse5.serialize(container);
}
exports.serializeNode = serializeNode;
/**
 * Finds an unused identifier name given a requested name and set of used names.
 */
function findAvailableIdentifier(requested, used) {
    let suffix = 0;
    let alias = requested;
    while (used.has(alias)) {
        alias = requested + '$' + (suffix++);
    }
    return alias;
}
exports.findAvailableIdentifier = findAvailableIdentifier;
/**
 * Detect if two Node's have the same source location.
 */
function isSourceLocationEqual(a, b) {
    if (a === b) {
        return true;
    }
    const aLoc = a.loc;
    const bLoc = b.loc;
    if (aLoc === bLoc) {
        return true;
    }
    if (aLoc == null || bLoc == null) {
        return false;
    }
    return aLoc.start.column === bLoc.start.column &&
        aLoc.start.line === bLoc.start.line &&
        aLoc.end.column === bLoc.end.column && aLoc.end.line === bLoc.end.line;
}
exports.isSourceLocationEqual = isSourceLocationEqual;
/**
 * Serialize a Node to string, wrapped as an estree template literal.
 */
function serializeNodeToTemplateLiteral(node, addNewLines = true) {
    const lines = parse5.serialize(node).split('\n');
    // Remove empty / whitespace-only leading lines.
    while (/^\s*$/.test(lines[0])) {
        lines.shift();
    }
    // Remove empty / whitespace-only trailing lines.
    while (/^\s*$/.test(lines[lines.length - 1])) {
        lines.pop();
    }
    let cooked = lines.join(os_1.EOL);
    if (addNewLines) {
        cooked = `${os_1.EOL}${cooked}${os_1.EOL}`;
    }
    // The `\` -> `\\` replacement must occur first so that the backslashes
    // introduced by later replacements are not replaced.
    const raw = cooked.replace(/(<\/script|\\|`|\$)/g, (_match, group) => {
        switch (group) {
            case `<\/script`:
                return '&lt;/script';
            case '\\':
                return '\\\\';
            case '`':
                return '\\`';
            case '$':
                return '\\$';
            default:
                throw new Error(`oops!: ${group}`);
        }
    });
    return jsc.templateLiteral([jsc.templateElement({ cooked, raw }, true)], []);
}
exports.serializeNodeToTemplateLiteral = serializeNodeToTemplateLiteral;
/**
 * Returns an array of identifiers if an expression is a chain of property
 * access, as used in namespace-style exports.
 */
function getMemberPath(expression) {
    if (expression.type !== 'MemberExpression' || expression.computed ||
        expression.property.type !== 'Identifier') {
        return;
    }
    const property = expression.property.name;
    if (expression.object.type === 'ThisExpression') {
        return ['this', property];
    }
    else if (expression.object.type === 'Identifier') {
        if (expression.object.name === 'window') {
            return [property];
        }
        else {
            return [expression.object.name, property];
        }
    }
    else if (expression.object.type === 'MemberExpression') {
        const prefixPath = getMemberPath(expression.object);
        if (prefixPath !== undefined) {
            return [...prefixPath, property];
        }
    }
    return undefined;
}
exports.getMemberPath = getMemberPath;
/**
 * Returns a string of identifiers (dot-seperated) if an expression is a chain
 * of property access, as used in namespace-style exports.
 */
function getMemberName(expression) {
    const path = getMemberPath(expression);
    return path ? path.join('.') : path;
}
exports.getMemberName = getMemberName;
/**
 * Returns an Identifier's name if Node is a simple Identifier. Otherwise,
 * get the full member name.
 */
function getMemberOrIdentifierName(expression) {
    if (expression.type === 'Identifier') {
        return expression.name;
    }
    return getMemberName(expression);
}
exports.getMemberOrIdentifierName = getMemberOrIdentifierName;
/**
 * Find the node in program that corresponds to the same part of code
 * as the given node.
 *
 * This method is necessary because program is parsed locally, but the
 * given node may have come from the analyzer (so a different parse run,
 * possibly by a different parser, though they output the same format).
 */
function getNodePathInProgram(program, astNode) {
    if (astNode === undefined || astNode.language !== 'js') {
        return;
    }
    const node = astNode.node;
    let associatedNodePath;
    astTypes.visit(program, {
        visitNode(path) {
            // Traverse first, because we want the most specific node that exactly
            // matches the given node.
            this.traverse(path);
            if (associatedNodePath === undefined &&
                isSourceLocationEqual(path.node, util_1.babelNodeToEstreeNode(node)) &&
                path.node.type === node.type) {
                associatedNodePath = path;
                return false;
            }
            return undefined;
        }
    });
    return associatedNodePath;
}
exports.getNodePathInProgram = getNodePathInProgram;
/**
 * Yields the NodePath for each statement at the top level of `program`.
 *
 * Like `yield* program.body` except it yields NodePaths rather than
 * Nodes, so that the caller can mutate the AST with the NodePath api.
 */
function* getTopLevelStatements(program) {
    const nodePaths = [];
    astTypes.visit(program, {
        visitNode(path) {
            if (!path.parent) {
                // toplevel program
                this.traverse(path);
                return;
            }
            if (path.parent.node.type !== 'Program') {
                // not a toplevel statement, skip it
                return false;
            }
            this.traverse(path);
            // ok, path.node must be a toplevel statement of the program.
            nodePaths.push(path);
            return;
        }
    });
    yield* nodePaths;
}
exports.getTopLevelStatements = getTopLevelStatements;
/**
 * If the given NodePath Node is on the left side of an assignment expression,
 * return a NodePath object for that assignment expression.
 *
 * Examples where the assignment expression is returned for `foo`:
 *
 *    foo = 10;
 *    window.foo = 10;
 *
 * Examples where an assignment expression is NOT matched:
 *
 *     bar = foo;
 *     foo();
 *     const foo = 10;
 *     this.foo = 10;
 */
function getPathOfAssignmentTo(path) {
    if (!path.parent) {
        return undefined;
    }
    const parentNode = path.parent.node;
    if (parentNode.type === 'AssignmentExpression') {
        if (parentNode.left === path.node) {
            return path.parent;
        }
        return undefined;
    }
    if (parentNode.type === 'MemberExpression' &&
        parentNode.property === path.node &&
        parentNode.object.type === 'Identifier' &&
        parentNode.object.name === 'window') {
        return getPathOfAssignmentTo(path.parent);
    }
    return undefined;
}
exports.getPathOfAssignmentTo = getPathOfAssignmentTo;
/**
 * Give the name of the setter we should use to set the given memberPath. Does
 * not check to see if the setter exists, just returns the name it would have.
 * e.g.
 *
 *     ['Polymer', 'foo', 'bar']    =>    'Polymer.foo.setBar'
 */
function getSetterName(memberPath) {
    const lastSegment = memberPath[memberPath.length - 1];
    memberPath[memberPath.length - 1] =
        `set${lastSegment.charAt(0).toUpperCase()}${lastSegment.slice(1)}`;
    return memberPath.join('.');
}
exports.getSetterName = getSetterName;
function filterClone(nodes, filter) {
    const clones = [];
    for (const node of nodes) {
        if (!filter(node)) {
            continue;
        }
        const clone = dom5.cloneNode(node);
        clones.push(clone);
        if (node.childNodes) {
            clone.childNodes = filterClone(node.childNodes, filter);
        }
    }
    return clones;
}
exports.filterClone = filterClone;
/**
 * Finds all identifiers within the given program and creates a set of their
 * names (strings). Identifiers in the `ignored` argument set will not
 * contribute to the output set.
 */
function collectIdentifierNames(program, ignored) {
    const identifiers = new Set();
    astTypes.visit(program, {
        visitIdentifier(path) {
            const node = path.node;
            if (!ignored.has(node)) {
                identifiers.add(path.node.name);
            }
            this.traverse(path);
        },
    });
    return identifiers;
}
exports.collectIdentifierNames = collectIdentifierNames;
/**
 * Returns true if a dom module ASTNode is eligible for inlining.
 */
function canDomModuleBeInlined(domModule) {
    if (domModule.attrs.some((a) => a.name !== 'id')) {
        return false; // attributes other than 'id' on dom-module
    }
    let templateTagsSeen = 0;
    for (const node of domModule.childNodes || []) {
        if (node.tagName === 'template') {
            if (node.attrs.length > 0) {
                return false; // attributes on template
            }
            templateTagsSeen++;
        }
        else if (node.tagName === 'script') {
            // this is fine, scripts are handled elsewhere
        }
        else if (dom5.isTextNode(node) && dom5.getTextContent(node).trim() === '') {
            // empty text nodes are fine
        }
        else {
            return false; // anything else, we can't convert it
        }
    }
    if (templateTagsSeen > 1) {
        return false; // more than one template tag, can't convert
    }
    return true;
}
exports.canDomModuleBeInlined = canDomModuleBeInlined;
/**
 * Yields all nodes inside the given node in top-down, first-to-last order.
 */
function* nodesInside(node) {
    const childNodes = parse5.treeAdapters.default.getChildNodes(node);
    if (childNodes === undefined) {
        return;
    }
    for (const child of childNodes) {
        yield child;
        yield* nodesInside(child);
    }
}
/**
 * Yields all nodes that come after the given node, including later siblings
 * of ancestors.
 */
function* nodesAfter(node) {
    const parentNode = node.parentNode;
    if (!parentNode) {
        return;
    }
    const siblings = parse5.treeAdapters.default.getChildNodes(parentNode);
    for (let i = siblings.indexOf(node) + 1; i < siblings.length; i++) {
        const laterSibling = siblings[i];
        yield laterSibling;
        yield* nodesInside(laterSibling);
    }
    yield* nodesAfter(parentNode);
}
/**
 * Returns the text of all comments in the document between the two optional
 * points.
 *
 * If `from` is given, returns all comments after `from` in the document.
 * If `until` is given, returns all comments up to `until` in the document.
 */
function getCommentsBetween(document, from, until) {
    const nodesStart = from === undefined ? nodesInside(document) : nodesAfter(from);
    const nodesBetween = ix_1.Iterable.from(nodesStart).takeWhile((node) => node !== until);
    const commentNodesBetween = nodesBetween.filter((node) => dom5.isCommentNode(node));
    const commentStringsBetween = commentNodesBetween.map((node) => dom5.getTextContent(node));
    const formattedCommentStringsBetween = commentStringsBetween.map((commentText) => {
        // If it looks like there might be jsdoc in the comment, start the
        // comment with an extra * so that the js comment looks like a jsdoc
        // comment.
        if (/@\w+/.test(commentText)) {
            return '*' + commentText;
        }
        return commentText;
    });
    return Array.from(formattedCommentStringsBetween);
}
exports.getCommentsBetween = getCommentsBetween;
/**
 * Given some comments, attach them to the first statement, if any, in the
 * given array of statements.
 *
 * If there is no first statement, one will be created.
 */
function attachCommentsToFirstStatement(comments, statements) {
    if (comments.length === 0) {
        return;
    }
    // A license comment is appropriate at the top of a file. Anything else
    //   should be checked.
    if (comments.filter((c) => !/@license/.test(c)).length > 0) {
        const message = `\n  FIXME(polymer-modulizer): the above comments were extracted\n` +
            `  from HTML and may be out of place here. Review them and\n` +
            `  then delete this comment!\n`;
        comments.push(message);
    }
    const recastComments = getCommentsFromTexts(comments);
    let firstStatement = statements[0];
    if (firstStatement === undefined) {
        firstStatement = jsc.expressionStatement(jsc.identifier(''));
        statements.unshift(firstStatement);
    }
    firstStatement.comments =
        recastComments.concat(firstStatement.comments || []);
}
exports.attachCommentsToFirstStatement = attachCommentsToFirstStatement;
function attachCommentsToEndOfProgram(comments, statements) {
    if (comments.length === 0) {
        return;
    }
    const message = `\n  FIXME(polymer-modulizer): the above comments were extracted\n` +
        `  from HTML and may be out of place here. Review them and\n` +
        `  then delete this comment!\n`;
    comments.push(message);
    const recastComments = getCommentsFromTexts(comments);
    const lastStatement = jsc.expressionStatement(jsc.identifier(''));
    lastStatement.comments =
        (lastStatement.comments || []).concat(recastComments);
    statements.push(lastStatement);
}
exports.attachCommentsToEndOfProgram = attachCommentsToEndOfProgram;
function getCommentsFromTexts(commentTexts) {
    const recastComments = commentTexts.map((comment) => {
        const escapedComment = comment.replace(/\*\//g, '*\\/');
        return {
            type: 'Block',
            leading: true,
            trailing: false,
            value: escapedComment,
        };
    });
    return recastComments;
}
/**
 * Returns true if the given program contains any expressions that write to the
 * global "settings" object.
 */
function containsWriteToGlobalSettingsObject(program) {
    let containsWriteToGlobalSettingsObject = false;
    // Note that we look for writes to these objects exactly, not to writes to
    // members of these objects.
    const globalSettingsObjects = new Set(['Polymer', 'Polymer.Settings', 'ShadyDOM']);
    function getNamespacedName(node) {
        if (node.type === 'Identifier') {
            return node.name;
        }
        const memberPath = getMemberPath(node);
        if (memberPath) {
            return memberPath.join('.');
        }
        return undefined;
    }
    astTypes.visit(program, {
        visitAssignmentExpression(path) {
            const name = getNamespacedName(path.node.left);
            if (globalSettingsObjects.has(name)) {
                containsWriteToGlobalSettingsObject = true;
            }
            return false;
        },
    });
    return containsWriteToGlobalSettingsObject;
}
exports.containsWriteToGlobalSettingsObject = containsWriteToGlobalSettingsObject;
/**
 * Create an array of statements that correctly insert the given parse5 (HTML)
 * nodes into JavaScript.
 */
function createDomNodeInsertStatements(nodes, activeInBody = false) {
    const varName = `$_documentContainer`;
    const fragment = {
        nodeName: '#document-fragment',
        attrs: [],
        childNodes: nodes,
        __location: {},
    };
    const templateValue = serializeNodeToTemplateLiteral(fragment, false);
    const createElementTemplate = jsc.variableDeclaration('const', [jsc.variableDeclarator(jsc.identifier(varName), jsc.callExpression(jsc.memberExpression(jsc.identifier('document'), jsc.identifier('createElement')), [jsc.literal('template')]))]);
    const setDocumentContainerStatement = jsc.expressionStatement(jsc.assignmentExpression('=', jsc.memberExpression(jsc.identifier(varName), jsc.identifier('innerHTML')), templateValue));
    const targetNode = activeInBody ? 'body' : 'head';
    return [
        createElementTemplate,
        setDocumentContainerStatement,
        jsc.expressionStatement(jsc.callExpression(jsc.memberExpression(jsc.memberExpression(jsc.identifier('document'), jsc.identifier(targetNode)), jsc.identifier('appendChild')), [jsc.memberExpression(jsc.identifier(varName), jsc.identifier('content'))]))
    ];
}
exports.createDomNodeInsertStatements = createDomNodeInsertStatements;
/**
 * Insert an array of statements into the program at the correct location. The
 * correct location for new statements is after ImportDeclarations, if any
 * exist.
 */
function insertStatementsIntoProgramBody(statements, program) {
    let insertionPoint = 0;
    for (let i = 0; i < program.body.length; i++) {
        const bodyStatement = program.body[i];
        if (bodyStatement.type === 'ImportDeclaration') {
            // cover the case where the import is at the end
            insertionPoint = i + 1;
        }
        else {
            // otherwise, break
            insertionPoint = i;
            break;
        }
    }
    program.body.splice(insertionPoint, 0, ...statements);
}
exports.insertStatementsIntoProgramBody = insertStatementsIntoProgramBody;
//# sourceMappingURL=document-util.js.map