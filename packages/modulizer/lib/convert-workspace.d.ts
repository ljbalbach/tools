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
import { WorkspaceRepo } from 'polymer-workspaces';
import { PartialConversionSettings } from './conversion-settings';
/**
 * Configuration options required for workspace conversions. Contains
 * information about which repos to convert and what new version to set
 * each npm package at.
 */
export interface WorkspaceConversionSettings extends PartialConversionSettings {
    packageVersion: string;
    workspaceDir: string;
    reposToConvert: WorkspaceRepo[];
}
export declare const GIT_STAGING_BRANCH_NAME = "polymer-modulizer-staging";
/**
 * The results of a conversion, as a map of converted package npm names -> their
 * full file path location on disk.
 */
export declare type ConversionResultsMap = Map<string, string>;
/**
 * Convert a set of workspace repos to npm packages and JavaScript modules.
 * Returns a map of all packages converted, keyed by npm package name.
 */
export default function convert(options: WorkspaceConversionSettings): Promise<ConversionResultsMap>;
