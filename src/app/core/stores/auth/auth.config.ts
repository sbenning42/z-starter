import { Schemas, Schema, Action } from 'src/app/core/z/core/types';
import { createAsyncActionConfig, createSyncActionConfig } from 'src/app/core/z/core/config-factories';

export const AUTH = 'AUTH';

export interface AuthCreds {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    password: string;
}

export interface AuthAuthentication {
    user: AuthUser;
    token: string;
}

export interface AuthState {
    authentified: boolean;
    credentials: AuthCreds;
    user: AuthUser;
    token: string;
}

export interface AuthSchema extends Schemas {
    setCredentials: Schema<AuthCreds>;
    removeCredentials: Schema;
    register: Schema<Partial<AuthUser>, AuthUser>;
    authenticate: Schema<AuthCreds, AuthAuthentication>;
    revoke: Schema<void, {}>;
}


export const initialAuth: AuthState = {
    authentified: false,
    credentials: null,
    user: null,
    token: null,
};

export const authActions = {
    setCredentials: createSyncActionConfig('[AUTH] Set Credentials'),
    removeCredentials: createSyncActionConfig('[AUTH] Remove Credentials', false),
    register: createAsyncActionConfig('[AUTH] Register'),
    authenticate: createAsyncActionConfig('[AUTH] Authenticate'),
    revoke: createAsyncActionConfig('[AUTH] Revoke', false),
};

export const authReducers = {
    setCredentials: {
        request: (state: AuthState, { payload }: Action<AuthCreds>) => ({
            ...state,
            credentials: payload,
        })
    },
    removeCredentials: {
        request: (state: AuthState) => ({
            ...state,
            credentials: null,
        })
    },
    register: {
        response: (state: AuthState, { payload }: Action<AuthUser>) => ({
            ...state,
            user: payload,
        }),
    },
    authenticate: {
        response: (state: AuthState, { payload }: Action<AuthAuthentication>) => ({
            ...state,
            authentified: true,
            user: payload.user,
            token: payload.token,
        }),
    },
    revoke: {
        response: (state: AuthState, { payload }: Action<{}>) => ({
            ...state,
            authentified: false,
            user: null,
            token: null,
        }),
    },
};
