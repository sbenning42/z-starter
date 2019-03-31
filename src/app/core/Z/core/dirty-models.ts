import { Store, select, createSelector } from '@ngrx/store';
import {
    Headers,
    Header,
    ActionWithoutPayload,
    ActionWithPayload,
    SyncAction,
    AsyncAction,
} from './models';
import { Action } from './types';
import { attachHeader } from './tools';
import {
    ASYNC_HEADER,
    typeAsRequest,
    typeAsResponse,
    typeAsCancel,
    typeAsError
} from './symbols';
import {
    AsyncRequestWithoutPayloadActionConstructor,
    AsyncRequestActionConstructor,
    SyncCreateActionWithoutPayloadConstructor,
    SyncCreateActionConstructor,
    ActionType,
    Dispatcher,
    ActionsSchema
} from './dirty-types';
import { Observable } from 'rxjs';

export class ActionFactory {
    constructor(protected store: Store<any>) {}
    create<Request, Response = void, Async extends boolean = Response extends void ? false : true>(
        type: string,
        async: Async = false as Async,
        hasPayload: Request extends void ? false : true = true as Request extends void ? false : true
    ) {

        const requestType = typeAsRequest(type);
        const responseType = typeAsResponse(type);
        const cancelType = typeAsCancel(type);
        const errorType = typeAsError(type);

        const _store = this.store;
        const _dispatch = <T>() => (action: Action<T>) => (_store.dispatch(action), action);
        
        class SyncCreateAction extends ActionWithPayload<Request> {
            static type = type;
            static dispatch = _dispatch<Request>();
            constructor(payload: Request, headers: Headers = new Headers()) {
                super(type, headers, payload);
            }
        }
        
        class SyncCreateActionWithouPayload extends ActionWithoutPayload {
            static type = type;
            static dispatch = _dispatch<void>();
            constructor(headers: Headers = new Headers()) {
                super(type, headers);
            }
        }

        class AsyncRequestAction extends ActionWithPayload<Request> {
            static type = requestType;
            static dispatch = _dispatch<Request>();
            constructor(payload: Request, headers: Headers = new Headers()) {
                super(requestType, attachHeader(headers, new Header(ASYNC_HEADER)), payload);
            }
        }
        
        class AsyncRequestActionWithouPayload extends ActionWithoutPayload {
            static type = requestType;
            static dispatch = _dispatch<void>();
            constructor(headers: Headers = new Headers()) {
                super(requestType, (headers.push(new Header(ASYNC_HEADER)), headers));
            }
        }
        
        class AsyncResponseAction extends ActionWithPayload<Response> {
            static type = responseType;
            static dispatch = _dispatch<Response>();
            constructor(payload: Response, async: Header, headers: Headers = new Headers()) {
                super(responseType, attachHeader(headers, async), payload);
            }
        }
        
        class AsyncCancelAction extends ActionWithoutPayload {
            static type = cancelType;
            static dispatch = _dispatch<void>();
            constructor(async: Header, headers: Headers = new Headers()) {
                super(cancelType, attachHeader(headers, async));
            }
        }
        
        class AsyncErrorAction extends ActionWithPayload<Error> {
            static type = errorType;
            static dispatch = _dispatch<Error>();
            constructor(payload: Error, async: Header, headers: Headers = new Headers()) {
                super(errorType, attachHeader(headers, async), payload);
            }
        }
        
        const AsyncRequestActionSwitchPayload = (
            hasPayload
                ? AsyncRequestAction
                : AsyncRequestActionWithouPayload
        ) as (
            Request extends void
                ? AsyncRequestWithoutPayloadActionConstructor & ActionType & Dispatcher<void>
                : AsyncRequestActionConstructor<Request> & ActionType & Dispatcher<Request>
        );
        
        const SyncActionSwitchPayload = (
            hasPayload
                ? SyncCreateAction
                : SyncCreateActionWithouPayload
        ) as (
            Request extends void
                ? SyncCreateActionWithoutPayloadConstructor & ActionType & Dispatcher<void>
                : SyncCreateActionConstructor<Request> & ActionType & Dispatcher<Request>
        );
        
        return (
            async
                ? new AsyncAction<Request, Response>(
                    AsyncRequestActionSwitchPayload,
                    AsyncResponseAction as any,
                    AsyncCancelAction as any, 
                    AsyncErrorAction as any,
                )
                : new SyncAction<Request>(SyncActionSwitchPayload)
        ) as Async extends false ? SyncAction<Request> : AsyncAction<Request, Response>;
    }
}

export class ZStore<State = {}, Schema extends ActionsSchema = {}> {
    protected Z: {
        [Key in keyof Schema]: Schema[Key]['2'] extends false
            ? SyncAction<Schema[Key]['0']>
            : AsyncAction<Schema[Key]['0'], Schema[Key]['1']>;
    } & {
        [Key in keyof State]: Observable<State[Key]>
    } & {
        _state: Observable<State>
    };
    constructor(
        public store: Store<any>,
        public selector: string,
        public initial: State = {} as any,
        public config: {
            [Key in keyof Schema]: string | {
                type: string,
                async: Schema[Key]['2'],
                hasPayload: Schema[Key]['0'] extends void ? false : true
            };
        } = {} as any
    ) {
        const asyncActionFactory = new ActionFactory(store);
        const selectState = states => states[selector] as State;
        this.Z = {
            ...Object.entries(initial).reduce((Z, [key]) => ({ ...Z,
                [key]: store.pipe(select(createSelector(selectState, state => state[key]))),
            }), { _state: store.pipe(select(selectState)) }),
            ...Object.entries(config).reduce((Z, [key, thisConfig]) => ({ ...Z,
                [key]: typeof(thisConfig) === 'string'
                    ? asyncActionFactory.create(thisConfig, false, true)
                    : asyncActionFactory.create(thisConfig.type, thisConfig.async, thisConfig.hasPayload),
            }), {}),
        } as any;
    }
}
