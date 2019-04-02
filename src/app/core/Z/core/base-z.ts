import { ActionsSchema } from './dirty-types';
import { Action } from './types';
import { createZStore } from './factory';
import { Store } from '@ngrx/store';
import { SyncAction, AsyncAction } from './models';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';

export type Dispatch<Schema extends ActionsSchema> = (
    action: Action<Schema[keyof Schema]['0'] | void>
) => Action<Schema[keyof Schema]['0'] | void>;

export type Z<State, Schema extends ActionsSchema> = {
    [Key in keyof Schema]: Schema[Key]['2'] extends false
        ? SyncAction<Schema[Key]['0']>
        : AsyncAction<Schema[Key]['0'], Schema[Key]['1']>;
} & {
    [Key in keyof State]: Observable<State[Key]>
} & {
    _state: Observable<State>
} & {
    _config: {
        [Key in keyof Schema]: string | {
            type: string,
            async: Schema[Key]['2'],
            hasPayload: Schema[Key]['0'] extends void ? false : true
        };
    },
    _initial: State,
};

export class BaseZ<State, Schema extends ActionsSchema> {
    dispatch: Dispatch<Schema>;
    Z: Z<State, Schema>;
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>,
        public selector: string,
        public initial: State,
        public actionsConfig: {
            [Key in keyof Schema]: string | {
                type: string;
                async: Schema[Key]['2'];
                hasPayload: Schema[Key]['0'] extends void ? false : true;
            }
        },
        public reducersConfig?: {
            [Key in keyof Schema]?: {
                request?: (state: State, action: Action<Schema[Key]['0']>) => State,
                response?: (state: State, action: Action<Schema[Key]['1']>) => State,
                cancel?: (state: State, action: Action<void>) => State,
                error?: (state: State, action: Action<Error>) => State,
            }
        }
    
    ) {
        this.Z = createZStore<State, Schema>(
            store,
            actions$,
            selector,
            initial,
            actionsConfig,
            reducersConfig,
        );
        this.dispatch = (action: Action<Schema[keyof Schema]['0']>) => (store.dispatch(action), action);
    }
}
