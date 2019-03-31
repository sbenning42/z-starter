import { ActionsSchema } from './dirty-types';
import { Store } from '@ngrx/store';
import { Action } from './types';
import { ZStore } from './dirty-models';
import { SyncAction, AsyncAction } from './models';
import { Observable } from 'rxjs';

export function createZStore<State, Schema extends ActionsSchema>(
    store: Store<any>,
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
    const Z = new ZStore<State, Schema>(store, selector, initial, config);
    const reducer = (state: State = initial, action: Action<any>) => {
        const [name] = Object.entries(config)
            .find(([, _config]) => typeof(_config) !== 'string' && action.type.includes(_config.type))
            || [undefined, undefined];
        if (name && reducerConfig[name] && Z[name]) {
            const Zaction = Z[name];
            const [, thisReducer] = Object.entries(Zaction)
                .find(([, propV]) => propV && propV['type'] && propV['type'] === action.type)
                || [undefined, undefined];
            if (thisReducer) {
                return (thisReducer as any)(state, action);
            }
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
