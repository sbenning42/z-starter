import * as UUID from 'uuid/v4';
import { Store, select, createSelector } from '@ngrx/store';
import { Observable, of, EMPTY } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { filter, map, switchMap, take, takeUntil, catchError, tap, withLatestFrom } from 'rxjs/operators';

export const ASYNC_CORRELATION = '[Z] Async Correlation';

export function uuid(): string {
    return UUID();
}
export class Header<Data = any> {
    id = uuid();
    constructor(
        public type: string,
        public data: Data = {} as any,
    ) {}
}
export class Headers extends Array<Header> {
    id = uuid();
}
export class ActionWithPayload<Payload> {
    constructor(
        public type: string,
        public headers: Headers = new Headers(),
        public payload: Payload,
    ) {}
}
export class ActionWithoutPayload {
    constructor(
        public type: string,
        public headers: Headers = new Headers(),
    ) {}
}
export type Action<Payload> = Payload extends void ? ActionWithoutPayload : ActionWithPayload<Payload>;
export interface ActionType {
    type: string;
}
export interface Dispatcher<Payload> {
    dispatch: (action: Action<Payload | void>) => Action<Payload | void>;
}

export type SyncCreateActionConstructor<Payload> = new (payload: Payload, headers?: Headers) => Action<Payload>;
export type SyncCreateActionWithoutPayloadConstructor = new (headers?: Headers) => Action<void>;
export type AsyncRequestActionConstructor<Request> = new (payload: Request, headers?: Headers) => Action<Request>;
export type AsyncRequestWithoutPayloadActionConstructor = new (headers?: Headers) => Action<void>;
export type AsyncResponseActionConstructor<Response> = new (payload: Response, async: Header, headers?: Headers) => Action<Response>;
export type AsyncCancelActionConstructor = new (async: Header, headers?: Headers) => Action<void>;
export type AsyncErrorActionConstructor = new (payload: Error, async: Header, headers?: Headers) => Action<Error>;

export class SyncAction<Payload> {
    constructor(
        public Create: Payload extends void
            ? SyncCreateActionWithoutPayloadConstructor & ActionType & Dispatcher<void>
            : SyncCreateActionConstructor<Payload> & ActionType & Dispatcher<Payload>,
    ) {}
}

export class AsyncAction<Request, Response> {
    constructor(
        public Request: Request extends void
            ? AsyncRequestWithoutPayloadActionConstructor & ActionType & Dispatcher<void>
            : AsyncRequestActionConstructor<Request> & ActionType & Dispatcher<Request>,
        public Response: AsyncResponseActionConstructor<Response> & ActionType & Dispatcher<Response>,
        public Cancel: AsyncCancelActionConstructor & ActionType & Dispatcher<void>,
        public Error: AsyncErrorActionConstructor & ActionType & Dispatcher<Error>,
    ) {

    }
}
export class ActionFactory {
    constructor(protected store: Store<any>) {}
    create<Request, Response = void, Async extends boolean = (Response extends void ? false : true)>(
        type: string,
        async: Async = false as Async,
        hasPayload: Request extends void ? false : true = true as Request extends void ? false : true
    ) {
        const _store = this.store;
        class AsyncRequestAction extends ActionWithPayload<Request> {
            static type = `${type} @ Z Async Request`;
            static dispatch = (action: Action<Request>) => _store.dispatch(action);
            constructor(payload: Request, headers: Headers = new Headers()) {
                super(`${type} @ Z Async Request`, (headers.push(new Header(ASYNC_CORRELATION)), headers), payload);
            }
        }
        class AsyncRequestActionWithouPayload extends ActionWithoutPayload {
            static type = `${type} @ Z Async Request`;
            static dispatch = (action: Action<void>) => _store.dispatch(action);
            constructor(headers: Headers = new Headers()) {
                super(`${type} @ Z Async Request`, (headers.push(new Header(ASYNC_CORRELATION)), headers));
            }
        }
        class SyncCreateAction extends ActionWithPayload<Request> {
            static type = type;
            static dispatch = (action: Action<Request>) => _store.dispatch(action);
            constructor(payload: Request, headers: Headers = new Headers()) {
                super(type, headers, payload);
            }
        }
        class SyncCreateActionWithouPayload extends ActionWithoutPayload {
            static type = type;
            static dispatch = (action: Action<void>) => _store.dispatch(action);
            constructor(headers: Headers = new Headers()) {
                super(type, headers);
            }
        }
        const AsyncRequestActionSwitchPayload = (hasPayload
            ? AsyncRequestAction
            : AsyncRequestActionWithouPayload) as (Request extends void
                ? AsyncRequestWithoutPayloadActionConstructor & ActionType & Dispatcher<void>
                : AsyncRequestActionConstructor<Request> & ActionType & Dispatcher<Request>);
        const SyncActionSwitchPayload = (hasPayload
            ? SyncCreateAction
            : SyncCreateActionWithouPayload) as (Request extends void
                ? SyncCreateActionWithoutPayloadConstructor & ActionType & Dispatcher<void>
                : SyncCreateActionConstructor<Request> & ActionType & Dispatcher<Request>);
        
        class AsyncResponseAction extends ActionWithPayload<Response> {
            static type = `${type} @ Z Async Response`;
            static dispatch = (action: Action<Response>) => _store.dispatch(action);
            constructor(payload: Response, async: Header, headers: Headers = new Headers()) {
                super(`${type} @ Z Async Response`, (headers.push(async), headers), payload);
            }
        }
        class AsyncCancelAction extends ActionWithoutPayload {
            static type = `${type} @ Z Async Cancel`;
            static dispatch = (action: Action<void>) => _store.dispatch(action);
            constructor(async: Header, headers: Headers = new Headers()) {
                super(`${type} @ Z Async Cancel`, (headers.push(async), headers));
            }
        }
        class AsyncErrorAction extends ActionWithPayload<Error> {
            static type = `${type} @ Z Async Error`;
            static dispatch = (action: Action<Error>) => _store.dispatch(action);
            constructor(payload: Error, async: Header, headers: Headers = new Headers()) {
                super(`${type} @ Z Async Error`, (headers.push(async), headers), payload);
            }
        }
        return (async
            ? new AsyncAction<Request, Response>(
                AsyncRequestActionSwitchPayload,
                AsyncResponseAction as any,
                AsyncCancelAction as any, 
                AsyncErrorAction as any,
        )
        : new SyncAction<Request>(
            SyncActionSwitchPayload
        )) as Async extends false ? SyncAction<Request> : AsyncAction<Request, Response>;
    }
}

export type ZActionSchema<Request = void, Response = void, Async extends boolean = (Response extends void ? false : true)> = [
    Request,
    Response,
    Async
];

export interface ZSchema {
    [x: string]: ZActionSchema<any, any, boolean>;
}

export class ZStore<State = {}, Schema extends ZSchema = {}> {
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
            [Key in keyof Schema]: string | { type: string, async: Schema[Key]['2'], hasPayload: Schema[Key]['0'] extends void ? false : true };
        } = {} as any
    ) {
        const mainAsyncActionFactory = new ActionFactory(store);
        const selectState = states => states[selector] as State;
        this.Z = {
            ...Object.entries(initial).reduce((Z, [key]) => ({
                ...Z,
                [key]: store.pipe(
                    select(createSelector(selectState, state => state[key]))
                ),
            }), {
                _state: store.pipe(
                    select(selectState)
                )
            }),
            ...Object.entries(config).reduce((Z, [key, thisConfig]) => ({
                ...Z,
                [key]: typeof(thisConfig) === 'string'
                    ? mainAsyncActionFactory.create(thisConfig, false, true)
                    : mainAsyncActionFactory.create(thisConfig.type, thisConfig.async, thisConfig.hasPayload),
            }), {}),
        } as any;
    }
}

export function createZStore<State, Schema extends ZSchema>(
    store: Store<any>,
    selector: string,
    initial: State,
    config: {
        [Key in keyof Schema]: string | { type: string, async: Schema[Key]['2'], hasPayload: Schema[Key]['0'] extends void ? false : true };
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
        const [name, thisConfig] = Object.entries(config)
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
            [Key in keyof Schema]: string | { type: string, async: Schema[Key]['2'], hasPayload: Schema[Key]['0'] extends void ? false : true };
        },
        _initial: State,
    };
}

export function syncConfig(type: string) {
    return { type , async: false as false, hasPayload: true as true };
}
export function asyncConfig(type: string) {
    return { type , async: true as true, hasPayload: true as true };
}

export function syncWoPayloadConfig(type: string) {
    return { type , async: false as false, hasPayload: false as false };
}
export function asyncWoPayloadConfig(type: string) {
    return { type , async: true as true, hasPayload: false as false };
}

export function withCorrelationId(id: string, grabCorrelation: boolean = true) {
    return (...types: string[]) => (actions$: Observable<Action<any>>) => actions$.pipe(
        ofType(...types),
        filter((action: Action<any>) => action.headers.some((header: Header) => header.id === id)),
        map((action: Action<any>) => grabCorrelation
            ? { action, async: action.headers.find((header: Header) => header.id === id) }
            : action
        ),
    );
}
export function withCorrelation(type: string, grabCorrelation: boolean = true) {
    return (...types: string[]) => (actions$: Observable<Action<any>>) => actions$.pipe(
        ofType(...types),
        filter((action: Action<any>) => action.headers.some((header: Header) => header.type === type)),
        map((action: Action<any>) => grabCorrelation
            ? { action, async: action.headers.find((header: Header) => header.type === type) }
            : action
        ),
    );
}

export const withAsyncCorrelation = withCorrelation(ASYNC_CORRELATION, false);
export const withGrabAsyncCorrelation = withCorrelation(ASYNC_CORRELATION);

export function basicAsyncResolve<Request, Response, ThisState>(
    action: AsyncAction<Request, Response>,
    resolver: (Request extends void
        ? ((thisState?: ThisState) => Observable<Response>)
        : ((payload: Request, thisState?: ThisState) => Observable<Response>)),
    thisState$?: Observable<ThisState>,
) {
    const _resolver: any = resolver;
    return (actions$: Observable<Action<any>>) => actions$.pipe(
        withGrabAsyncCorrelation(action.Request.type),
        withLatestFrom(thisState$ ? thisState$ : of({})),
        switchMap<[{ action: Action<any>, async: Header }, ThisState], Action<Response | Error>>(
            ([{ action: request, async }, thisState]) => (
                request['payload'] !== undefined
                    ? _resolver((request as ActionWithPayload<Request>).payload, thisState)
                    : _resolver(thisState)
            ).pipe(
                take(1),
                map((payload: Response) => new action.Response(payload, async)),
                catchError((error: Error) => of(new action.Error(error, async))),
                takeUntil(actions$.pipe(withCorrelationId(async.id)(action.Cancel.type))),
            )
        ),
    );
}

export function dispatchForStore<Payload>(store: Store<any>) {
    return (action: Action<Payload | void>) => store.dispatch(action);
}
