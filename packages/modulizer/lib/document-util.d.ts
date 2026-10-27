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
import * as astTypes from 'ast-types';
import { NodePath } from 'ast-types';
import * as dom5 from 'dom5';
import * as estree from 'estree';
import * as parse5 from 'parse5';
import { AstNodeWithLanguage } from 'polymer-analyzer';
/**
 * Serialize a parse5 Node to a string.
 */
export declare function serializeNode(node: parse5.ASTNode): string;
/**
 * Finds an unused identifier name given a requested name and set of used names.
 */
export declare function findAvailableIdentifier(requested: string, used: Set<string>): string;
/**
 * Detect if two Node's have the same source location.
 */
export declare function isSourceLocationEqual(a: estree.Node, b: estree.Node): boolean;
/**
 * Serialize a Node to string, wrapped as an estree template literal.
 */
export declare function serializeNodeToTemplateLiteral(node: parse5.ASTNode, addNewLines?: boolean): estree.TemplateLiteral;
/**
 * Returns an array of identifiers if an expression is a chain of property
 * access, as used in namespace-style exports.
 */
export declare function getMemberPath(expression: estree.Node): string[] | undefined;
/**
 * Returns a string of identifiers (dot-seperated) if an expression is a chain
 * of property access, as used in namespace-style exports.
 */
export declare function getMemberName(expression: estree.Node): string | undefined;
/**
 * Returns an Identifier's name if Node is a simple Identifier. Otherwise,
 * get the full member name.
 */
export declare function getMemberOrIdentifierName(expression: estree.Node): string | undefined;
/**
 * Find the node in program that corresponds to the same part of code
 * as the given node.
 *
 * This method is necessary because program is parsed locally, but the
 * given node may have come from the analyzer (so a different parse run,
 * possibly by a different parser, though they output the same format).
 */
export declare function getNodePathInProgram(program: estree.Program, astNode: AstNodeWithLanguage | undefined): astTypes.NodePath<estree.Node> | undefined;
/**
 * Yields the NodePath for each statement at the top level of `program`.
 *
 * Like `yield* program.body` except it yields NodePaths rather than
 * Nodes, so that the caller can mutate the AST with the NodePath api.
 */
export declare function getTopLevelStatements(program: estree.Program): IterableIterator<astTypes.NodePath<estree.Node>>;
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
export declare function getPathOfAssignmentTo(path: NodePath): NodePath<estree.AssignmentExpression> | undefined;
/**
 * Give the name of the setter we should use to set the given memberPath. Does
 * not check to see if the setter exists, just returns the name it would have.
 * e.g.
 *
 *     ['Polymer', 'foo', 'bar']    =>    'Polymer.foo.setBar'
 */
export declare function getSetterName(memberPath: string[]): string;
export declare function filterClone(nodes: parse5.ASTNode[], filter: dom5.Predicate): parse5.ASTNode[];
/**
 * Finds all identifiers within the given program and creates a set of their
 * names (strings). Identifiers in the `ignored` argument set will not
 * contribute to the output set.
 */
export declare function collectIdentifierNames(program: estree.Program, ignored: ReadonlySet<estree.Identifier>): Set<string>;
/**
 * Returns true if a dom module ASTNode is eligible for inlining.
 */
export declare function canDomModuleBeInlined(domModule: parse5.ASTNode): boolean;
/**
 * Returns the text of all comments in the document between the two optional
 * points.
 *
 * If `from` is given, returns all comments after `from` in the document.
 * If `until` is given, returns all comments up to `until` in the document.
 */
export declare function getCommentsBetween(document: parse5.ASTNode, from: parse5.ASTNode | undefined, until: parse5.ASTNode | undefined): string[];
/**
 * Given some comments, attach them to the first statement, if any, in the
 * given array of statements.
 *
 * If there is no first statement, one will be created.
 */
export declare function attachCommentsToFirstStatement(comments: string[], statements: Array<estree.Statement | estree.ModuleDeclaration>): void;
export declare function attachCommentsToEndOfProgram(comments: string[], statements: Array<estree.Statement | estree.ModuleDeclaration>): void;
/**
 * Returns true if the given program contains any expressions that write to the
 * global "settings" object.
 */
export declare function containsWriteToGlobalSettingsObject(program: estree.Program): boolean;
/**
 * Create an array of statements that correctly insert the given parse5 (HTML)
 * nodes into JavaScript.
 */
export declare function createDomNodeInsertStatements(nodes: parse5.ASTNode[], activeInBody?: boolean): estree.Statement[];
/**
 * Insert an array of statements into the program at the correct location. The
 * correct location for new statements is after ImportDeclarations, if any
 * exist.
 */
export declare function insertStatementsIntoProgramBody(statements: estree.Statement[], program: estree.Program): void;
