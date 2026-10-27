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
Object.defineProperty(exports, "__esModule", { value: true });
class Def {
    constructor(name) {
        this._fields = new Map();
        this._name = name;
    }
    bases(...bases) {
        this._bases = bases;
        return this;
    }
    field(name, type, default_) {
        this._fields.set(name, {
            name,
            type,
            default: default_,
        });
        return this;
    }
    build(...fields) {
        this._build = fields;
        return this;
    }
}
exports.Def = Def;
class Or {
    constructor(types) {
        this.types = types;
    }
}
exports.Or = Or;
function typeString(type) {
    let isArray = false;
    let name;
    if (Array.isArray(type)) {
        isArray = true;
        // arrays are always 1 value, becuase why not?
        type = type[0];
    }
    if (type instanceof Def) {
        name = `estree.${type._name}`;
    }
    else if (type instanceof Or) {
        name = '(' + type.types.map((t) => typeString(t)).join('|') + ')';
    }
    else if (type === null) {
        name = 'null';
    }
    else if (type === String) {
        name = 'string';
    }
    else if (type === Number) {
        name = 'number';
    }
    else if (type === Boolean) {
        name = 'boolean';
    }
    else if (type === RegExp) {
        name = 'RegExp';
    }
    else {
        name = `'${type}'`;
    }
    return name + (isArray ? '[]' : '');
}
exports.typeString = typeString;
function nullable(type) {
    if (type == null) {
        return true;
    }
    if (Array.isArray(type)) {
        return nullable(type[0]);
    }
    if (type instanceof Or) {
        return type.types.some((t) => nullable(t));
    }
    return false;
}
exports.nullable = nullable;
class TypeApi {
    constructor() {
        this.types = new Map();
        // Arrow function to support tear-offs
        this.def = (name) => {
            let def = this.types.get(name);
            if (def === undefined) {
                def = new Def(name);
                this.types.set(name, def);
            }
            return def;
        };
    }
    or(..._defs) {
        return new Or(_defs);
    }
}
exports.Type = new TypeApi();
//# sourceMappingURL=types.js.map