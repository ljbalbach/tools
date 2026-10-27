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
import { Disposable, IConnection } from 'vscode-languageserver';
export declare class EventStream<T> {
    static create<T>(): {
        fire: (value: T) => void;
        stream: EventStream<T>;
    };
    private handlers;
    private fire;
    listen(handler: (value: T) => void): {
        dispose: () => void;
    };
    /**
     * Return a fresh Promise that resolves with the next value.
     *
     * Mostly useful in tests.
     */
    readonly next: Promise<T>;
}
export declare class AutoDisposable implements Disposable {
    dispose(): void;
    protected readonly disposables: Disposable[];
}
/**
 * Declares a method that ensures that we don't throw uncaught errors, as
 * that can result in intrusive stack trace popups for users.
 */
export declare abstract class Handler extends AutoDisposable {
    protected abstract connection: IConnection;
    /**
     * If the given promise rejects, unobtrusively log the error and return the
     * fallback value instead.
     */
    protected handleErrors<Result, Fallback>(promise: Promise<Result>, fallbackValue: Fallback): Promise<Result | Fallback>;
}
export interface Change<T> {
    newer: T;
    older: T;
}
