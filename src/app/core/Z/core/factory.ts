import { ActionsSchema } from './dirty-types';
import { Store } from '@ngrx/store';
import { Action } from './types';
import { ZStore } from './dirty-models';
import { SyncAction, AsyncAction } from './models';
import { Observable } from 'rxjs';
import { typeAsRequest, typeAsResponse, typeAsCancel, typeAsError } from './symbols';
import { Actions } from '@ngrx/effects';

export function createZStore<State, Schema extends ActionsSchema>(
    store: Store<any>,
    actions$: Actions<Action<any>>,
    selector: string,
    initial: State,
    config: {
        [Key in keyof Schema]: string | {
            type: string,
            async: Schema[Key]['2'],
            hasPayload: Schema[Key]['0'] extends void ? false : true
        };
    },
    reducerConfig: {
        [Key in keyof Schema]?: {
            request?: (state: State, action: Action<Schema[keyof Schema]['0']>) => State;
            response?: (state: State, action: Action<Schema[keyof Schema]['1']>) => State;
            cancel?: (state: State, action: Action<void>) => State;
            error?: (state: State, action: Action<Error>) => State;
        }
    } = {}
) {
    const Z = new ZStore<State, Schema>(store, actions$, selector, initial, config);
    const reducer = (state: State = initial, action: Action<any>) => {
        const [name, thisConfig] = Object.entries(config)
            .find(([, _config]) => typeof(_config) !== 'string' && action.type.includes(_config.type))
            || [undefined, undefined];
        if (name && reducerConfig[name]) {
            if (typeof(thisConfig) !== 'string') {
                if (reducerConfig[name].request &&
                    (thisConfig.type === action.type || typeAsRequest(thisConfig.type) === action.type)
                ) {
                    return reducerConfig[name].request(state, action as any);
                } else if (reducerConfig[name].response && typeAsResponse(thisConfig.type) === action.type) {
                    return reducerConfig[name].response(state, action as any);
                } else if (reducerConfig[name].cancel && typeAsCancel(thisConfig.type) === action.type) {
                    return reducerConfig[name].cancel(state, action as any);
                } else if (reducerConfig[name].error && typeAsError(thisConfig.type) === action.type) {
                    return reducerConfig[name].error(state, action as any);
                }
                return state;
            }
            return state;
        }
        return state;
    }
    store.addReducer(selector, reducer);
    return {
        _config: Z.config,
        _initial: Z.initial,
        ...Z['Z'] as any,
    } as {
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
}
