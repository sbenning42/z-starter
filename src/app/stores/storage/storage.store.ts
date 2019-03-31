import { Injectable } from "@angular/core";
import { BaseZ } from 'src/app/core/z/core/base-z';
import {
    StorageSchema,
    STORAGE,
    initialStorage,
    storageActionsConfig,
    storageReducersConfig,
    StorageState
} from './storage.config';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from 'src/app/core/z/core/types';
import { tap } from 'rxjs/operators';
import { basicAsyncHeaderResolver } from 'src/app/core/z/custom-rxjs-operators/resolve-async-header';
import { ASYNC_HEADER } from 'src/app/core/z/core/symbols';
import { of } from 'rxjs';

@Injectable()
export class StorageStore extends BaseZ<StorageState, StorageSchema> {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>,
    ) {
        super(store, STORAGE, initialStorage, storageActionsConfig, storageReducersConfig);
    }
    @Effect({ dispatch: false })
    protected getEffect$ = this.actions$.pipe(
        tap(action => console.log(action)),
        basicAsyncHeaderResolver(
            ASYNC_HEADER,
            this.Z.get,
            () => of([]),
        ),
        tap(action => console.log(action)),
    );
}
