import { Schemas, Schema, Action } from 'src/app/core/z/core/types';
import { createAsyncActionConfig, createSyncActionConfig } from 'src/app/core/z/core/config-factories';

export const APP = 'APP';

export interface AppLoading {
    id: string;
}

export interface AppError {
    id: string;
}

export interface AppState {
    ready: boolean;
    loading: boolean;
    error: boolean;
    loadings: AppLoading[];
    errors: AppError[];
}

export interface AppSchema extends Schemas {
    initialize: Schema;
    initialized: Schema;
    loadStart: Schema<AppLoading>;
    loadStop: Schema<AppLoading>;
    errStart: Schema<AppError>;
    errStop: Schema<AppError>;
    startLoading: Schema;
    stopLoading: Schema;
    clearLoadings: Schema;
    startError: Schema;
    stopError: Schema;
    clearErrors: Schema;
}


export const initialApp: AppState = {
    ready: false,
    loading: false,
    error: false,
    loadings: [],
    errors: [],
};

export const appActions = {
    initialize: createSyncActionConfig('[APP] Initialize', false),
    initialized: createSyncActionConfig('[APP] Initialized', false),
    loadStart: createSyncActionConfig('[APP] Load Start'),
    loadStop: createSyncActionConfig('[APP] Load Stop'),
    errStart: createSyncActionConfig('[APP] Err Start'),
    errStop: createSyncActionConfig('[APP] Err Stop'),
    startLoading: createSyncActionConfig('[APP] Start Loading', false),
    stopLoading: createSyncActionConfig('[APP] Stop Loading', false),
    clearLoadings: createSyncActionConfig('[APP] Clear Loadings', false),
    startError: createSyncActionConfig('[APP] Start Error', false),
    stopError: createSyncActionConfig('[APP] Stop Error', false),
    clearErrors: createSyncActionConfig('[APP] Clear Errors', false),
};

export const appReducers = {
    initialized: {
        request: (state: AppState) => ({ ...state, ready: true }),
    },
    loadStart: {
        request: (state: AppState, { payload }: Action<AppLoading>) => ({
            ...state,
            loadings: [payload, ...state.loadings],
        }),
    },
    loadStop: {
        request: (state: AppState, { payload }: Action<AppLoading>) => ({
            ...state,
            loadings: state.loadings.filter(loading => loading.id !== payload.id),
        }),
    },
    errStart: {
        request: (state: AppState, { payload }: Action<AppError>) => ({
            ...state,
            errors: [payload, ...state.errors],
        }),
    },
    errStop: {
        request: (state: AppState, { payload }: Action<AppError>) => ({
            ...state,
            errors: state.errors.filter(error => error.id !== payload.id),
        }),
    },
    startLoading: {
        request: (state: AppState) => ({
            ...state,
            loading: true,
        }),
    },
    stopLoading: {
        request: (state: AppState) => ({
            ...state,
            loading: false,
        }),
    },
    clearLoadings: {
        request: (state: AppState) => ({
            ...state,
            loading: false,
            loadings: [],
        }),
    },
    startError: {
        request: (state: AppState) => ({
            ...state,
            error: true,
        }),
    },
    stopError: {
        request: (state: AppState) => ({
            ...state,
            error: false,
        }),
    },
    clearErrors: {
        request: (state: AppState) => ({
            ...state,
            error: false,
            errors: []
        }),
    },
};
