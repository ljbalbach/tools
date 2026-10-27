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
import { Analyzer, EditResult, Warning } from 'polymer-analyzer';
import { Linter } from '../linter';
export declare class WarningPrettyPrinter {
    prettyPrint(warnings: ReadonlyArray<Warning>): string[];
}
/**
 * Assert that applying all fixes to the given input file results in
 * the given golden output file.
 */
export declare function assertExpectedFixes(linter: Linter, analyzer: Analyzer, inputFile: string, goldenFile: string): Promise<void>;
/**
 * Assert that applying the given edit result modifies the given input file
 * and results in the contents of the given golden output file.
 *
 * Like assertExpectedFixes, but can also test edit actions.
 */
export declare function assertFileEdited(analyzer: Analyzer, editResult: EditResult, inputFile: string, goldenFile: string): Promise<void>;
