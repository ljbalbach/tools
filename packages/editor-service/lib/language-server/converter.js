"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const polymer_analyzer_1 = require("polymer-analyzer");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
/**
 * Converts between Analyzer and Editor Service types and LSP types.
 */
class AnalyzerLSPConverter {
    constructor(workspaceUri, urlResolver) {
        this.workspaceUri = workspaceUri;
        this.urlResolver = urlResolver;
    }
    getWorkspacePathToFile(document) {
        // TODO(rictic): if this isn't a file uri we should return undefined here.
        return path.relative(this.workspaceUri.fsPath, vscode_uri_1.default.parse(document.uri).fsPath);
    }
    getAnalyzerUrl(document) {
        return this.urlResolver.resolve(document.uri);
    }
    getUriForLocalPath(localPath) {
        const workspacePath = this.workspaceUri.fsPath;
        const absolutePath = path.join(workspacePath, localPath);
        return vscode_uri_1.default.file(absolutePath).toString();
    }
    convertWarningToDiagnostic(warning) {
        return {
            code: warning.code,
            message: warning.message,
            range: this.convertPRangeToL(warning.sourceRange),
            source: 'polymer-ide',
            severity: this.convertSeverity(warning.severity),
        };
    }
    convertPosition({ line, character: column }) {
        return { line, column };
    }
    convertSourcePosition({ line, column: character }) {
        return { line, character };
    }
    convertPRangeToL({ start, end }) {
        return {
            start: { line: start.line, character: start.column },
            end: { line: end.line, character: end.column }
        };
    }
    convertLRangeToP({ start, end }, document) {
        const file = this.getAnalyzerUrl(document);
        if (file === undefined) {
            return undefined;
        }
        return {
            start: { line: start.line, column: start.character },
            end: { line: end.line, column: end.character },
            file,
        };
    }
    convertSeverity(severity) {
        switch (severity) {
            case polymer_analyzer_1.Severity.ERROR:
                return vscode_languageserver_1.DiagnosticSeverity.Error;
            case polymer_analyzer_1.Severity.WARNING:
                return vscode_languageserver_1.DiagnosticSeverity.Warning;
            case polymer_analyzer_1.Severity.INFO:
                return vscode_languageserver_1.DiagnosticSeverity.Information;
            default:
                throw new Error(`This should never happen. Got a severity of ${severity}`);
        }
    }
    editToWorkspaceEdit(fix) {
        return this.editsToWorkspaceEdit([fix]);
    }
    editsToWorkspaceEdit(edits) {
        const edit = { changes: {} };
        const changes = edit.changes;
        for (const polymerEdit of edits) {
            for (const replacement of polymerEdit) {
                const uri = replacement.range.file;
                if (!changes[uri]) {
                    changes[uri] = [];
                }
                changes[uri].push(vscode_languageserver_1.TextEdit.replace(this.convertPRangeToL(replacement.range), replacement.replacementText));
            }
        }
        return edit;
    }
    getLocation(sourceRange) {
        return { uri: sourceRange.file, range: this.convertPRangeToL(sourceRange) };
    }
}
exports.default = AnalyzerLSPConverter;
//# sourceMappingURL=converter.js.map