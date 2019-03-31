import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Schemas, Schema, Action } from 'src/app/core/Z/core/types';
import { createAsyncActionConfig } from 'src/app/core/Z/core/config-factories';

export const STORAGE = 'STORAGE';

export type Scheme<Schema = any> = {
    [X in keyof Schema]: Schema[X];
};

export interface _Identifiable {
    id: string;
}

export type Identifiable<Schema = any> = _Identifiable & Scheme<Schema>;

export interface StorageState extends EntityState<Identifiable> {
    loaded: boolean;
}

export const storageAdapter = createEntityAdapter<Identifiable>({ sortComparer: false });

export const initialStorage: StorageState = storageAdapter.getInitialState({ loaded: false });

export interface StorageSchema extends Schemas {
    get: Schema<void, Identifiable[]>;
    save: Schema<Identifiable[], Identifiable[]>;
    remove: Schema<string[], string[]>;
    clear: Schema<void, []>;
}

export const storageActionsConfig = {
    get: createAsyncActionConfig('[STORAGE] Get', false),
    save: createAsyncActionConfig('[STORAGE] Save'),
    remove: createAsyncActionConfig('[STORAGE] Remove'),
    clear: createAsyncActionConfig('[STORAGE] Clear', false),
};

export const storageReducersConfig = {
    get: {
        response: (state: StorageState, { payload }: Action<Identifiable[]>) => ({
            ...storageAdapter.addAll(payload, state),
        }),
    },
    save: {
        response: (state: StorageState, { payload }: Action<Identifiable[]>) => ({
            ...storageAdapter.upsertMany(payload, state),
        }),
    },
    remove: {
        response: (state: StorageState, { payload }: Action<string[]>) => ({
            ...storageAdapter.removeMany(payload, state),
        }),
    },
    clear: {
        response: (state: StorageState, { payload }: Action<{}>) => ({
            ...storageAdapter.removeAll(state),
        }),
    },
};
