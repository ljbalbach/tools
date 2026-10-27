/**
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
import { Edit, ResolvedUrl, Severity, SourcePosition, SourceRange, UrlResolver, Warning } from 'polymer-analyzer';
import { Diagnostic, DiagnosticSeverity, Location, Position as LSPosition, Range as LSRange, WorkspaceEdit } from 'vscode-languageserver';
import Uri from 'vscode-uri';
/**
 * Converts between Analyzer and Editor Service types and LSP types.
 */
export default class AnalyzerLSPConverter {
    private readonly workspaceUri;
    private readonly urlResolver;
    constructor(workspaceUri: Uri, urlResolver: UrlResolver);
    getWorkspacePathToFile(document: {
        uri: string;
    }): string;
    getAnalyzerUrl(document: {
        uri: string;
    }): ResolvedUrl | undefined;
    getUriForLocalPath(localPath: string): string;
    convertWarningToDiagnostic(warning: Warning): Diagnostic;
    convertPosition({ line, character: column }: LSPosition): SourcePosition;
    convertSourcePosition({ line, column: character }: SourcePosition): LSPosition;
    convertPRangeToL({ start, end }: SourceRange): LSRange;
    convertLRangeToP({ start, end }: LSRange, document: {
        uri: string;
    }): SourceRange | undefined;
    convertSeverity(severity: Severity): DiagnosticSeverity;
    editToWorkspaceEdit(fix: Edit): WorkspaceEdit;
    editsToWorkspaceEdit(edits: Iterable<Edit>): WorkspaceEdit;
    getLocation(sourceRange: SourceRange): Location;
}
