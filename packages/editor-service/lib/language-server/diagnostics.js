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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const polymer_analyzer_1 = require("polymer-analyzer");
const polymer_linter_1 = require("polymer-linter");
const vscode_languageserver_1 = require("vscode-languageserver");
const commands_1 = require("./commands");
const util_1 = require("./util");
const minimatch = require("minimatch");
/**
 * Handles publishing diagnostics and code actions on those diagnostics.
 */
class DiagnosticGenerator extends util_1.Handler {
    constructor(analyzer, converter, connection, settings, analyzerSynchronizer, documents) {
        super();
        this.analyzer = analyzer;
        this.converter = converter;
        this.connection = connection;
        this.settings = settings;
        this.documents = documents;
        this.warningCodesToFilterOut = new Set();
        this.fileGlobsToFilterOut = [];
        /**
         * Used so that if we don't have any warnings to report for a file on the
         * next go around we can remember to send an empty array.
         */
        this.urisReportedWarningsFor = new Set();
        this.updateLinter();
        connection.onDidCloseTextDocument((event) => {
            if (!settings.analyzeWholePackage) {
                // If the user hasn't asked for whole-package analysis then it's
                // annoying to see warnings for files that aren't open, and in any
                // case, we'll never update those diagnostics while the file is closed.
                connection.sendDiagnostics({ diagnostics: [], uri: event.textDocument.uri });
            }
        });
        settings.projectConfigChangeStream.listen(() => {
            this.updateLinter();
        });
        this.disposables.push(analyzerSynchronizer.analysisChanges.listen(() => {
            this.reportWarnings();
        }));
        settings.changeStream.listen(({ newer, older }) => {
            if (newer.analyzeWholePackage !== older.analyzeWholePackage) {
                // When we switch this setting we want to be sure that we'll clear out
                // warnings that were reported with the old setting but not the new
                // one.
                if (newer.analyzeWholePackage) {
                    this.urisReportedWarningsFor = new Set(this.documents.keys());
                }
                else {
                    for (const uri of this.urisReportedWarningsFor) {
                        this.connection.sendDiagnostics({ uri, diagnostics: [] });
                    }
                }
                this.reportWarnings();
            }
        });
        this.connection.onCodeAction((req) => __awaiter(this, void 0, void 0, function* () {
            return this.handleErrors(this.getCodeActions(req), []);
        }));
        this.connection.onWillSaveTextDocumentWaitUntil((req) => __awaiter(this, void 0, void 0, function* () {
            if (this.settings.fixOnSave) {
                return this.handleErrors(this.getFixesForFile(req.textDocument.uri), []);
            }
            return [];
        }));
    }
    getAllFixes() {
        return __awaiter(this, void 0, void 0, function* () {
            const { warnings, analysis } = yield this.linter.lintPackage();
            const fixes = [];
            for (const warning of warnings) {
                if (warning.fix) {
                    fixes.push(warning.fix);
                }
            }
            // Don't apply conflicting edits to the workspace.
            const parseLoader = polymer_analyzer_1.makeParseLoader(this.analyzer, analysis);
            const { appliedEdits } = yield polymer_analyzer_1.applyEdits(fixes, parseLoader);
            return this.converter.editsToWorkspaceEdit(appliedEdits);
        });
    }
    getFixesForFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const { warnings, analysis } = yield this.linter.lint([uri]);
            const edits = [];
            for (const warning of warnings) {
                if (!warning.fix) {
                    continue;
                }
                // A fix can touch multiple files. We can only update this document
                // though, so skip any fixes that touch others.
                if (warning.fix.some((repl) => repl.range.file !== uri)) {
                    continue;
                }
                edits.push(warning.fix);
            }
            const { appliedEdits } = yield polymer_analyzer_1.applyEdits(edits, polymer_analyzer_1.makeParseLoader(this.analyzer, analysis));
            const textEdits = [];
            for (const appliedEdit of appliedEdits) {
                for (const replacement of appliedEdit) {
                    textEdits.push(vscode_languageserver_1.TextEdit.replace(this.converter.convertPRangeToL(replacement.range), replacement.replacementText));
                }
            }
            return textEdits;
        });
    }
    updateLinter() {
        let rules = new Set();
        const projectConfig = this.settings.projectConfig;
        let configDiagnostic = this.settings.projectConfigDiagnostic;
        if (projectConfig.lint) {
            const lintConfig = projectConfig.lint;
            if (lintConfig.rules) {
                try {
                    rules = polymer_linter_1.registry.getRules(lintConfig.rules);
                }
                catch (e) {
                    configDiagnostic = {
                        code: 'linter-registry-error',
                        message: e && e.message || '' + e,
                        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                        source: 'polymer-ide',
                        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
                    };
                }
            }
            this.warningCodesToFilterOut = new Set(lintConfig.ignoreWarnings);
            this.fileGlobsToFilterOut =
                (lintConfig.filesToIgnore ||
                    []).map((glob) => new minimatch.Minimatch(glob, {}));
        }
        const polymerJsonDiagnostics = [];
        if (configDiagnostic) {
            polymerJsonDiagnostics.push(configDiagnostic);
        }
        this.connection.sendDiagnostics({
            uri: this.converter.getUriForLocalPath('polymer.json'),
            diagnostics: polymerJsonDiagnostics
        });
        const linter = new polymer_linter_1.Linter(rules, this.analyzer);
        this.linter = linter;
        this.reportWarnings();
    }
    reportWarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.settings.analyzeWholePackage) {
                return this.reportPackageWarnings((yield this.linter.lintPackage()).warnings);
            }
            else {
                return this.reportWarningsForOpenFiles();
            }
        });
    }
    reportWarningsForOpenFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const openURIs = this.documents.keys();
            const paths = openURIs.map((uri) => this.converter.getWorkspacePathToFile({ uri }))
                .filter((path) => !this.fileGlobsToFilterOut.some((glob) => glob.match(path)));
            const { warnings } = yield this.linter.lint(paths);
            const diagnosticsByUri = new Map(openURIs.map((k) => [k, []]));
            for (const warning of this.filterWarnings(warnings)) {
                const diagnostic = this.converter.convertWarningToDiagnostic(warning);
                const diagnostics = diagnosticsByUri.get(warning.sourceRange.file) || [];
                diagnostics.push(diagnostic);
                diagnosticsByUri.set(warning.sourceRange.file, diagnostics);
            }
            // These diagnostics are reported elsewhere.
            diagnosticsByUri.delete(this.converter.getUriForLocalPath('polymer.json'));
            for (const [uri, diagnostics] of diagnosticsByUri) {
                this.connection.sendDiagnostics({ uri, diagnostics });
            }
        });
    }
    filterWarnings(warnings) {
        return warnings.filter((w) => !(this.warningCodesToFilterOut.has(w.code) ||
            this.fileGlobsToFilterOut.some((glob) => glob.match(this.converter.getWorkspacePathToFile({ uri: w.sourceRange.file })))));
    }
    /**
     * Report the given warnings for the package implicitly defined by the
     * workspace.
     *
     * This is pulled out into its own non-async function to document and maintain
     * the invariant that there must not be an await between the initial read of
     * urisReportedWarningsFor and the write of it at the end.
     */
    reportPackageWarnings(warnings) {
        const reportedLastTime = new Set(this.urisReportedWarningsFor);
        this.urisReportedWarningsFor = new Set();
        const diagnosticsByUri = new Map();
        for (const warning of this.filterWarnings(warnings)) {
            const uri = warning.sourceRange.file;
            reportedLastTime.delete(uri);
            this.urisReportedWarningsFor.add(uri);
            let diagnostics = diagnosticsByUri.get(uri);
            if (!diagnostics) {
                diagnostics = [];
                diagnosticsByUri.set(uri, diagnostics);
            }
            diagnostics.push(this.converter.convertWarningToDiagnostic(warning));
        }
        diagnosticsByUri.delete(this.converter.getUriForLocalPath('polymer.json'));
        for (const [uri, diagnostics] of diagnosticsByUri) {
            this.connection.sendDiagnostics({ uri, diagnostics });
        }
        for (const uriWithNoWarnings of reportedLastTime) {
            this.connection.sendDiagnostics({ uri: uriWithNoWarnings, diagnostics: [] });
        }
        this.urisReportedWarningsFor = new Set(diagnosticsByUri.keys());
    }
    getCodeActions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = [];
            if (req.context.diagnostics.length === 0) {
                // Currently we only support code actions on Warnings,
                // so we can early-exit in the case where there aren't any.
                return commands;
            }
            const { warnings } = yield this.linter.lint([req.textDocument.uri]);
            const requestedRange = this.converter.convertLRangeToP(req.range, req.textDocument);
            if (requestedRange === undefined) {
                return commands;
            }
            for (const warning of warnings) {
                if ((!warning.fix &&
                    (!warning.actions || warning.actions.length === 0)) ||
                    !isRangeInside(warning.sourceRange, requestedRange)) {
                    continue;
                }
                if (warning.fix) {
                    commands.push(this.createApplyEditCommand(`Quick fix the '${warning.code}' warning`, warning.fix));
                }
                if (warning.actions) {
                    for (const action of warning.actions) {
                        if (action.kind !== 'edit') {
                            continue;
                        }
                        commands.push(this.createApplyEditCommand(
                        // Take up to the first newline.
                        action.description.split('\n')[0], action.edit));
                    }
                }
            }
            return commands;
        });
    }
    createApplyEditCommand(title, edit) {
        return vscode_languageserver_1.Command.create(title, commands_1.applyEditCommandName, this.converter.editToWorkspaceEdit(edit));
    }
}
exports.default = DiagnosticGenerator;
function isRangeInside(inner, outer) {
    return polymer_analyzer_1.isPositionInsideRange(inner.start, outer, true) &&
        polymer_analyzer_1.isPositionInsideRange(inner.end, outer, true);
}
//# sourceMappingURL=diagnostics.js.map