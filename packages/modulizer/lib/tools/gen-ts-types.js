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
require('source-map-support').install();
const types_1 = require("./lib/types");
const fork = {
    use(o) {
        return o;
    },
};
function leadingLowerCase(s) {
    return s[0].toLowerCase() + s.substring(1);
}
function getField(type, name) {
    let field = type._fields.get(name);
    if (field === undefined && type._bases) {
        for (const baseName of type._bases) {
            const baseDef = types_1.Type.types.get(baseName);
            if (baseDef) {
                field = getField(baseDef, name);
                if (field !== undefined) {
                    break;
                }
            }
        }
    }
    return field;
}
function getName(name) {
    if (name === 'default') {
        return 'default_';
    }
    return name;
}
require('./def/core')(fork);
require('./def/es6')(fork);
require('./def/babel')(fork);
require('./def/esprima')(fork);
const types = [...types_1.Type.types.values()];
const builders = types.filter((t) => t._build != null).map((t) => {
    const build = t._build;
    const name = leadingLowerCase(t._name);
    const fields = build.map((f) => getField(t, f));
    let lastRequiredIndex = -1;
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field === undefined) {
            console.error(`field not found: ${build[i]} for type ${t._name}`);
        }
        const optional = field.default != null || types_1.nullable(field.type);
        if (!optional) {
            lastRequiredIndex = i;
        }
    }
    let i = 0;
    const args = build.map((f) => {
        const field = getField(t, f);
        if (field == null) {
            console.error(`field ${f} not found for type ${t._name}`);
            return '';
        }
        const optional = i > lastRequiredIndex &&
            (field.default !== null || types_1.nullable(field.type));
        i++;
        const name = getName(field.name);
        return `${name}${optional ? '?' : ''}: ${types_1.typeString(field.type)}`;
    });
    return `export function ${name}(${args.join(', ')}): estree.${t._name};\n`;
});
const declaration = `
// Note: This file is generated and has known type-checking warnings
// due to differences between the estree TypeScript declarations and
// the AST nodes defined by ast-types.

// This file is meant to be paired with a hand-written jscodeshift.d.ts
// that exports jscodeshift

declare module 'jscodeshift' {
  import * as estree from 'estree';

  declare module jscodeshift {

    ${builders.join('\n    ')}
  }

}
`;
console.log(declaration);
//# sourceMappingURL=gen-ts-types.js.map