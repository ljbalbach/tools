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
const polymer_analyzer_1 = require("polymer-analyzer");
class EventStream {
    constructor() {
        this.handlers = new Set();
    }
    static create() {
        const stream = new EventStream();
        const fire = stream.fire.bind(stream);
        return { fire, stream };
    }
    fire(value) {
        for (const handler of this.handlers) {
            handler(value);
        }
    }
    listen(handler) {
        this.handlers.add(handler);
        return {
            dispose: () => {
                this.handlers.delete(handler);
            }
        };
    }
    /**
     * Return a fresh Promise that resolves with the next value.
     *
     * Mostly useful in tests.
     */
    get next() {
        return new Promise((resolve) => {
            const disposable = this.listen((value) => {
                disposable.dispose();
                resolve(value);
            });
        });
    }
}
exports.EventStream = EventStream;
class AutoDisposable {
    constructor() {
        this.disposables = [];
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
}
exports.AutoDisposable = AutoDisposable;
/**
 * Declares a method that ensures that we don't throw uncaught errors, as
 * that can result in intrusive stack trace popups for users.
 */
class Handler extends AutoDisposable {
    /**
     * If the given promise rejects, unobtrusively log the error and return the
     * fallback value instead.
     */
    handleErrors(promise, fallbackValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield promise;
            }
            catch (err) {
                // Ignore WarningCarryingExceptions, they're expected, and made visible
                //   to the user in a useful way. All other exceptions should be logged
                //   if possible.
                if (!(err instanceof polymer_analyzer_1.WarningCarryingException)) {
                    this.connection.console.warn(err.stack || err.message || err);
                }
                return fallbackValue;
            }
        });
    }
}
exports.Handler = Handler;
//# sourceMappingURL=util.js.map