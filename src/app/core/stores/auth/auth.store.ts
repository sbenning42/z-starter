import { Injectable } from "@angular/core";
import { BaseZ } from 'src/app/core/z/core/base-z';
import { AuthState, AuthSchema, AUTH, initialAuth, authActions, authReducers, AuthUser, AuthCreds } from './auth.config';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from 'src/app/core/z/core/types';
import { AuthService } from 'src/app/core/mocks/auth/auth.service';
import { basicAsyncHeaderResolver } from 'src/app/core/z/custom-rxjs-operators/resolve-async-header';
import { ASYNC_HEADER } from 'src/app/core/z/core/symbols';

@Injectable()
export class AuthStore extends BaseZ<AuthState, AuthSchema> {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>,
        public auth: AuthService,
    ) {
        super(store, actions$, AUTH, initialAuth, authActions, authReducers);
    }
    @Effect({ dispatch: true })
    protected registerEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.register,
            (payload: Partial<AuthUser>) => this.auth.register(payload)
        ),
    );
    @Effect({ dispatch: true })
    protected authenticateEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.authenticate,
            (payload: AuthCreds) => this.auth.authenticate(payload)
        ),
    );
    @Effect({ dispatch: true })
    protected revokeEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.revoke,
            (token: string) => this.auth.revoke(token),
            this.Z.token,
        ),
    );
}
