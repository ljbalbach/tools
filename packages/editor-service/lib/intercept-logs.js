"use strict";
/**
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
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
/**
 * Once this file is imported, all subsequent plylog based logging will take
 * place through the LSP connection (once it is set up).
 *
 * As it is common for modules to instantiate their loggers upon import,
 * this log interception must take place as a side effect of importing this
 * module, and this module should be imported before any others.
 *
 * Forwarding logging like this helps us both by making the logs available and
 * by ensuring that we don't disrupt the stdio-based communication channel
 * between the LSP server and the editor.
 *
 * See https://github.com/Polymer/vscode-plugin/issues/48 for more info on
 * the class of bug that this fixes.
 */
const plylog = require("plylog");
const util = require("util");
const Transport = require("winston-transport");
const ForwardingTransport = function (_options) { };
util.inherits(ForwardingTransport, Transport);
ForwardingTransport.console = undefined;
ForwardingTransport.prototype.log = function (level, msg, _meta, callback) {
    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }
    const console = ForwardingTransport.console;
    if (!console) {
        // TODO(rictic): store these calls in memory and send them over when the
        //     console link is established.
        return;
    }
    switch (level) {
        case 'debug':
        case 'silly':
        case 'info':
        case 'verbose':
            console.info(msg);
            break;
        case 'warn':
        case 'error':
            console.warn(msg);
            break;
        default:
            const never = level;
            console.warn(`Got an unknown log level: ${never}`);
            console.warn(msg);
    }
    callback(null, true);
};
plylog.defaultConfig.transportFactory = (options) => new ForwardingTransport(options);
function hookUpRemoteConsole(console) {
    if (ForwardingTransport.console) {
        throw new Error('set remote console twice!');
    }
    ForwardingTransport.console = console;
}
exports.hookUpRemoteConsole = hookUpRemoteConsole;
function log() {
    if (!ForwardingTransport.console) {
        return;
    }
    const args = Array.prototype.slice.call(arguments);
    const strArgs = args.map((arg) => {
        if (typeof arg === 'string') {
            return arg;
        }
        return util.inspect(arg);
    });
    ForwardingTransport.console.log(strArgs.join(' '));
}
exports.log = log;
/** Replace console.log, warn, debug, etc with our safe version. */
console.log = log;
console.warn = log;
console.error = log;
console.info = log;
console.dir = log;
console.time = () => null;
console.timeEnd = () => null;
//# sourceMappingURL=intercept-logs.js.map