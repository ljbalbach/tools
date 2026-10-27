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
const polymer_project_config_1 = require("polymer-project-config");
const vscode_languageserver_1 = require("vscode-languageserver");
const util_1 = require("./util");
class Settings extends util_1.AutoDisposable {
    constructor(connection, fileSynchronizer, analyzer) {
        super();
        this.analyzer = analyzer;
        this.latest = Object.assign({}, Settings.defaults);
        this.projectConfig = new polymer_project_config_1.ProjectConfig({});
        this.projectConfigDiagnostic = null;
        const { fire, stream } = util_1.EventStream.create();
        this.changeStream = stream;
        let resolveReady;
        this.ready = new Promise((resolve) => resolveReady = resolve);
        setTimeout(resolveReady, 1000);
        connection.onDidChangeConfiguration((change) => {
            resolveReady();
            const settingsWrapper = change.settings;
            const settings = settingsWrapper ? settingsWrapper['polymer-ide'] : {};
            const previous = this.latest;
            this.latest = Object.assign({}, Settings.defaults, settings);
            fire({ newer: this.latest, older: previous });
        });
        this.fileSynchronizer = fileSynchronizer;
        this.disposables.push(this.fileSynchronizer.fileChanges.listen((changes) => {
            const polymerJsonUri = analyzer.resolveUrl('polymer.json');
            for (const change of changes) {
                if (change.uri === polymerJsonUri) {
                    this.updateProjectConfig();
                }
            }
        }));
        this.updateProjectConfig();
        const { fire: firePcc, stream: pccStream } = util_1.EventStream.create();
        this.projectConfigChangeStream = pccStream;
        this.fireProjectConfigChange = firePcc;
    }
    updateProjectConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the file isn't there or isn't readable or whatever, just use an
            // empty object, it's fine.
            let jsonContent = '{}';
            try {
                const url = this.analyzer.resolveUrl('polymer.json');
                if (url !== undefined) {
                    jsonContent = yield this.fileSynchronizer.urlLoader.load(url);
                }
            }
            catch (_a) {
                // Fall back to empty object.
            }
            let projectConfig;
            let diagnostic = null;
            try {
                const projectConfigJson = JSON.parse(jsonContent);
                projectConfig = polymer_project_config_1.ProjectConfig.validateAndCreate(projectConfigJson);
            }
            catch (e) {
                // TODO: do something with this error. If we had good support for
                //   json documents in the analyzer we could construct a Warning.
                diagnostic = {
                    code: 'bad-polymer-json',
                    message: `Invalid polymer.json file: ${e && e.message || '' + e}`,
                    severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    source: 'polymer-ide',
                    range: { start: { character: 0, line: 0 }, end: { character: 0, line: 0 } }
                };
                projectConfig = new polymer_project_config_1.ProjectConfig({});
            }
            const older = {
                diagnostic: this.projectConfigDiagnostic,
                projectConfig: this.projectConfig
            };
            const newer = { diagnostic, projectConfig };
            this.projectConfig = projectConfig;
            this.projectConfigDiagnostic = diagnostic;
            this.fireProjectConfigChange({ older, newer });
        });
    }
    get analyzeWholePackage() {
        return this.latest.analyzeWholePackage;
    }
    get fixOnSave() {
        return this.latest.fixOnSave;
    }
    get referencesCodeLens() {
        return this.latest.referencesCodeLens;
    }
    get logToClient() {
        return this.latest.logToClient;
    }
    get logToFile() {
        return this.latest.logToFile;
    }
}
Settings.defaults = {
    analyzeWholePackage: false,
    fixOnSave: false,
    referencesCodeLens: false,
    logToClient: false,
    logToFile: undefined,
};
exports.default = Settings;
//# sourceMappingURL=settings.js.map