import { ZSchema, ZActionSchema, asyncWoPayloadConfig, asyncConfig, createZStore, Action, basicAsyncResolve, dispatchForStore } from '../Z/Z';
import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage/storage.service';
import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs';

export const storageSelector = 'STORAGE';

export interface Entries {
    [x: string]: any;
}

export interface StorageState {
    entries: Entries;
    loaded: boolean;
}

export const initialStorageState: StorageState = {
    entries: null,
    loaded: false,
};

export interface StorageSchema extends ZSchema {
    get: ZActionSchema<void, Entries>;
    save: ZActionSchema<Entries, Entries>;
    remove: ZActionSchema<string[], string[]>;
    clear: ZActionSchema<void, {}>;
}

export type StoragePayloads = {} | Entries | string[] | Error;

export const storageConfig = {
    get: asyncWoPayloadConfig('[STORAGE] Get'),
    save: asyncConfig('[STORAGE] Save'),
    remove: asyncConfig('[STORAGE] Remove'),
    clear: asyncWoPayloadConfig('[STORAGE] Clear'),
};

@Injectable()
export class StorageStore {

    Z = createZStore<StorageState, StorageSchema>(this.store, storageSelector, initialStorageState, storageConfig);
    dispatch = dispatchForStore(this.store);

    constructor(
        protected store: Store<any>,
        protected actions$: Actions<Action<any>>,
        protected storage: StorageService,
    ) {
        const storageReducer = (state: StorageState = initialStorageState, { type, payload: rawPayload }: Action<StoragePayloads>) => {
            switch (type) {
                case this.Z.get.Response.type: {
                    const payload = rawPayload as Entries;
                    return { ...state, loaded: true, entries: payload };
                }
                case this.Z.save.Response.type: {
                    const payload = rawPayload as Entries;
                    return { ...state, entries: { ...state.entries, ...payload } };
                }
                case this.Z.remove.Response.type: {
                    const payload = rawPayload as string[];
                    const NotRemovedOnly = (E: Entries, [K, V]) => payload.includes(K) ? { ...E } : { ...E, [K]: V };
                    const entries = Object.entries(state.entries).reduce(NotRemovedOnly, {});
                    return { ...state, entries };
                }
                case this.Z.clear.Response.type: {
                    const payload = rawPayload as {};
                    return { ...state, entries: {} };
                }
                case this.Z.get.Request.type:
                case this.Z.save.Request.type:
                case this.Z.remove.Request.type:
                case this.Z.clear.Request.type:
                case this.Z.get.Error.type:
                case this.Z.save.Error.type:
                case this.Z.remove.Error.type:
                case this.Z.clear.Error.type:
                case this.Z.get.Cancel.type:
                case this.Z.save.Cancel.type:
                case this.Z.remove.Cancel.type:
                case this.Z.clear.Cancel.type:
                default:
                    return state;
            }
        }
        store.addReducer(storageSelector, storageReducer);
    }
    @Effect({ dispatch: true })
    protected get$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.get, () => of({}))
    );
    @Effect({ dispatch: true })
    protected save$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.save, (payload: Entries) => of(payload))
    );
    @Effect({ dispatch: true })
    protected remove$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.remove, (payload: string[]) => of(payload))
    );
    @Effect({ dispatch: true })
    protected clear$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.clear, () => of({}))
    );
}
