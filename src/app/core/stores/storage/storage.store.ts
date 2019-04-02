import { Injectable } from "@angular/core";
import { BaseZ } from 'src/app/core/z/core/base-z';
import {
    StorageSchema,
    STORAGE,
    initialStorage,
    storageActionsConfig,
    storageReducersConfig,
    StorageState,
    Identifiable
} from './storage.config';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from 'src/app/core/z/core/types';
import { map } from 'rxjs/operators';
import { basicAsyncHeaderResolver } from 'src/app/core/z/custom-rxjs-operators/resolve-async-header';
import { ASYNC_HEADER } from 'src/app/core/z/core/symbols';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { getHeader } from '../../z/core/models';

@Injectable()
export class StorageStore extends BaseZ<StorageState, StorageSchema> {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>,
        public storage: StorageService
    ) {
        super(store, actions$, STORAGE, initialStorage, storageActionsConfig, storageReducersConfig);
    }

    @Effect({ dispatch: true })
    protected getEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.get,
            () => this.storage.get().pipe(map(Object.values)),
            undefined,
            request => [getHeader(header => header.type.includes('Component@'))(request)],
            request => [getHeader(header => header.type.includes('Component@'))(request)],
        ),
    );
    
    @Effect({ dispatch: true })
    protected saveEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.save,
            (payload: Identifiable[]) => this.storage.save(
                payload.reduce((entries, entry) => ({ ...entries, [entry.id]: entry }), {})
            ).pipe(map(Object.values)),
            undefined,
            request => [getHeader(header => header.type.includes('Component@'))(request)],
            request => [getHeader(header => header.type.includes('Component@'))(request)],
        ),
    );
    
    @Effect({ dispatch: true })
    protected removeEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.remove,
            (keys: string[]) => this.storage.remove(keys),
            undefined,
            request => [getHeader(header => header.type.includes('Component@'))(request)],
            request => [getHeader(header => header.type.includes('Component@'))(request)],
        ),
    );
    
    @Effect({ dispatch: true })
    protected clearEffect$ = this.actions$.pipe(
        basicAsyncHeaderResolver(ASYNC_HEADER, this.Z.clear,
            () => this.storage.clear().pipe(map(() => [])),
            undefined,
            request => [getHeader(header => header.type.includes('Component@'))(request)],
            request => [getHeader(header => header.type.includes('Component@'))(request)],
        ),
    );
}
