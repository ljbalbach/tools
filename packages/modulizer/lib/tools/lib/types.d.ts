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
export declare class Def {
    _name: string;
    _bases: string[] | undefined;
    _fields: Map<string, Field>;
    _build: string[] | undefined;
    constructor(name: string);
    bases(...bases: string[]): this;
    field(name: string, type: TypeDef, default_?: {}): this;
    build(...fields: string[]): this;
}
export declare class Or {
    types: TypeDef[];
    constructor(types: TypeDef[]);
}
export interface Field {
    name: string;
    type: TypeDef;
    default?: ({});
}
declare type TypeDefSingle = Def | Or | string | StringConstructor | NumberConstructor | BooleanConstructor | RegExpConstructor | null;
export declare type TypeDef = TypeDefSingle | TypeDefSingle[];
export declare function typeString(type: TypeDef): string;
export declare function nullable(type: TypeDef): boolean;
declare class TypeApi {
    types: Map<string, Def>;
    def: (name: string) => Def;
    or(..._defs: TypeDef[]): Or;
}
export declare const Type: TypeApi;
export {};
