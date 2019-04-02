import { Store, select, createSelector } from '@ngrx/store';
import {
    Headers,
    Header,
    ActionWithoutPayload,
    ActionWithPayload,
    SyncAction,
    AsyncAction,
    attachHeader,
    grabHeader,
    asHeaders
} from './models';
import { Action, HeadersType } from './types';
import {
    ASYNC_HEADER,
    typeAsRequest,
    typeAsResponse,
    typeAsCancel,
    typeAsError,
    isARequestType,
    isAResponseType,
    isACancelType,
    isAnErrorType
} from './symbols';
import {
    AsyncRequestWithoutPayloadActionConstructor,
    AsyncRequestActionConstructor,
    SyncCreateActionWithoutPayloadConstructor,
    SyncCreateActionConstructor,
    ActionType,
    Dispatcher,
    ActionsSchema,
    Notifier
} from './dirty-types';
import { Observable, of, EMPTY } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { withHeaderIds } from '../custom-rxjs-operators/filters';
import { take, filter, switchMap } from 'rxjs/operators';

export class ActionFactory {
    constructor(
        protected store: Store<any>,
        protected actions$: Actions<Action<any>>,
    ) {}
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
        const _onRequest = <Request>() => (request: Action<Request | void>) => {
            const async = grabHeader(ASYNC_HEADER)(request);
            return this.actions$.pipe(
                withHeaderIds(async.id),
                take(1),
                switchMap((action: Action<Request>) => isARequestType(action.type) ? of(action) : EMPTY)
            ) as Observable<Action<Request>>;
        };
        const _onFinish = <Request, Response>() => (request: Action<Request | void>) => {
            const async = grabHeader(ASYNC_HEADER)(request);
            return this.actions$.pipe(
                filter(action => action.type !== request.type),
                withHeaderIds(async.id),
                take(1),
            ) as Observable<Action<Response | Error>>;
        };
        const _onResponse = <Request, Response>() => (request: Action<Request | void>) => {
            const async = grabHeader(ASYNC_HEADER)(request);
            return this.actions$.pipe(
                filter(action => action.type !== request.type),
                withHeaderIds(async.id),
                take(1),
                switchMap((action: Action<Response>) => isAResponseType(action.type) ? of(action) : EMPTY)
            ) as Observable<Action<Response>>;
        };
        const _onCancel = <Request>() => (request: Action<Request | void>) => {
            const async = grabHeader(ASYNC_HEADER)(request);
            return this.actions$.pipe(
                filter(action => action.type !== request.type),
                withHeaderIds(async.id),
                take(1),
                switchMap((action: Action<void>) => isACancelType(action.type) ? of(action) : EMPTY)
            ) as Observable<Action<void>>;
        };
        const _onError = <Request>() => (request: Action<Request | void>) => {
            const async = grabHeader(ASYNC_HEADER)(request);
            return this.actions$.pipe(
                filter(action => action.type !== request.type),
                withHeaderIds(async.id),
                take(1),
                switchMap((action: Action<Error>) => isAnErrorType(action.type) ? of(action) : EMPTY)
            ) as Observable<Action<Error>>;
        };
        
        class SyncCreateAction extends ActionWithPayload<Request> {
            static type = type;
            static dispatch = _dispatch<Request>();
            static onFinish = _onFinish<any, any>();
            static onRequest = _onRequest<any>();
            static onResponse = _onResponse<any, any>();
            static onCancel = _onCancel<any>();
            static onError = _onError<any>();
            constructor(payload: Request, headers: HeadersType = []) {
                super(type, asHeaders(headers), payload);
            }
        }
        
        class SyncCreateActionWithouPayload extends ActionWithoutPayload {
            static type = type;
            static dispatch = _dispatch<void>();
            static onFinish = _onFinish<any, any>();
            static onRequest = _onRequest<any>();
            static onResponse = _onResponse<any, any>();
            static onCancel = _onCancel<any>();
            static onError = _onError<any>();
            constructor(headers: HeadersType = []) {
                super(type, asHeaders(headers));
            }
        }

        class AsyncRequestAction extends ActionWithPayload<Request> {
            static type = requestType;
            static dispatch = _dispatch<Request>();
            static onFinish = _onFinish<Request, Response>();
            static onRequest = _onRequest<Request>();
            static onResponse = _onResponse<Request, Response>();
            static onCancel = _onCancel<Request>();
            static onError = _onError<Request>();
            constructor(payload: Request, headers: HeadersType = []) {
                super(requestType, attachHeader(asHeaders(headers), new Header(ASYNC_HEADER)), payload);
            }
        }
        
        class AsyncRequestActionWithouPayload extends ActionWithoutPayload {
            static type = requestType;
            static dispatch = _dispatch<void>();
            static onFinish = _onFinish<void, Response>();
            static onRequest = _onRequest<Request>();
            static onResponse = _onResponse<Request, Response>();
            static onCancel = _onCancel<Request>();
            static onError = _onError<Request>();
            constructor(headers: HeadersType = []) {
                super(requestType, attachHeader(asHeaders(headers), new Header(ASYNC_HEADER)));
            }
        }
        
        class AsyncResponseAction extends ActionWithPayload<Response> {
            static type = responseType;
            static dispatch = _dispatch<Response>();
            constructor(payload: Response, public request: Action<Request>, headers: HeadersType = []) {
                super(responseType, attachHeader(asHeaders(headers), grabHeader(ASYNC_HEADER)(request)), payload);
            }
        }
        
        class AsyncCancelAction extends ActionWithoutPayload {
            static type = cancelType;
            static dispatch = _dispatch<void>();
            constructor(public request: Action<Request>, headers: HeadersType = []) {
                super(cancelType, attachHeader(asHeaders(headers), grabHeader(ASYNC_HEADER)(request)));
            }
        }
        
        class AsyncErrorAction extends ActionWithPayload<Error> {
            static type = errorType;
            static dispatch = _dispatch<Error>();
            constructor(payload: Error, public request: Action<Request>, headers: HeadersType = []) {
                super(errorType, attachHeader(asHeaders(headers), grabHeader(ASYNC_HEADER)(request)), payload);
            }
        }
        
        const AsyncRequestActionSwitchPayload = (
            hasPayload
                ? AsyncRequestAction
                : AsyncRequestActionWithouPayload
        ) as (
            Request extends void
                ? AsyncRequestWithoutPayloadActionConstructor & ActionType & Dispatcher<void> & Notifier<void, Response>
                : AsyncRequestActionConstructor<Request> & ActionType & Dispatcher<Request> & Notifier<Request, Response>
        );
        
        const SyncActionSwitchPayload = (
            hasPayload
                ? SyncCreateAction
                : SyncCreateActionWithouPayload
        ) as (
            Request extends void
                ? SyncCreateActionWithoutPayloadConstructor & ActionType & Dispatcher<void> & Notifier<void, any>
                : SyncCreateActionConstructor<Request> & ActionType & Dispatcher<Request> & Notifier<void, any>
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
        public actions$: Actions<Action<any>>,
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
        const asyncActionFactory = new ActionFactory(store, actions$);
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
