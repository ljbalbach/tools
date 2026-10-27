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
const fs_1 = require("fs");
class Logger {
    constructor(options) {
        this.logFile = undefined;
        this.queue = [];
        this.connection = options.connection;
        if (options.logToFileFlag !== undefined) {
            this.logFileFromFlag = undefined;
            try {
                this.logFileFromFlag =
                    fs_1.createWriteStream(options.logToFileFlag, { flags: 'a' });
            }
            catch (_a) {
                // don't care
            }
        }
    }
    hookupSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            settings.changeStream.listen(({ older, newer }) => {
                if (older.logToFile !== newer.logToFile) {
                    if (this.logFile) {
                        this.logFile.end();
                        this.logFile = undefined;
                    }
                    if (newer.logToFile) {
                        try {
                            this.logFile = fs_1.createWriteStream(newer.logToFile, { flags: 'a' });
                        }
                        catch (_a) {
                            this.logFile = undefined;
                        }
                    }
                }
            });
            // Wait for settings to stabilize. We might be getting an update
            // from the client, but we might not, it is optional.
            yield settings.ready;
            // Start logging as the settings request.
            this.settings = settings;
            // Write out all queued messages, then empty the queue.
            for (const queuedMessage of this.queue) {
                this.log(queuedMessage);
            }
            this.queue.length = 0;
        });
    }
    dispose() {
        if (this.logFile) {
            this.logFile.end();
            this.logFile = undefined;
        }
    }
    log(message) {
        if (this.settings) {
            if (this.settings.logToClient) {
                this.connection.console.log(message);
            }
            if (this.logFile !== undefined) {
                try {
                    this.logFile.write(message + '\n');
                }
                catch (_a) {
                    // don't care
                }
            }
            if (this.logFileFromFlag !== undefined) {
                try {
                    this.logFileFromFlag.write(message + '\n');
                }
                catch (_b) {
                    // don't care
                }
            }
        }
        else {
            this.queue.push(message);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map