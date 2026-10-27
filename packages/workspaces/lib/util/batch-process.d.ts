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
/** Concurrency presets based on some basic benchmarking & common-sense. */
export declare const npmPublishConcurrencyPreset = 6;
export declare const fsConcurrencyPreset = 6;
export declare const githubConcurrencyPreset = 16;
/**
 * When running a batch process, return two collections: one of successful runs
 * that completed without throwing an exception, and one where an exception
 * occurred.
 */
export interface BatchProcessResponse<T, V> {
    successes: Map<T, V>;
    failures: Map<T, Error>;
}
/**
 * Run some function of work over each item in an array (where the function is
 * called with each item as an argument). Group the results by successes an
 * failures based on whether an exception was thrown by that function.
 */
export declare function batchProcess<T, V>(items: T[], fn: (repo: T) => Promise<V>, options?: {
    concurrency: number;
}): Promise<BatchProcessResponse<T, V>>;
/**
 * A generic function interface, useful for extending the batchProcess generic
 * function signature.
 * See: https://www.typescriptlang.org/docs/handbook/generics.html
 */
export interface BatchProcessFn<T, V = any> {
    (items: T[], fn: (repo: T) => Promise<V>, options?: {
        concurrency: number;
    }): Promise<BatchProcessResponse<T, V>>;
}
