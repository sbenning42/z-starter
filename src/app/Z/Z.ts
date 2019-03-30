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
            ? SyncCreateActionWithoutPayloadConstructor & ActionType
            : SyncCreateActionConstructor<Payload> & ActionType,
    ) {}
}

export class AsyncAction<Request, Response> {
    constructor(
        public Request: Request extends void
            ? AsyncRequestWithoutPayloadActionConstructor & ActionType
            : AsyncRequestActionConstructor<Request> & ActionType,
        public Response: AsyncResponseActionConstructor<Response> & ActionType,
        public Cancel: AsyncCancelActionConstructor & ActionType,
        public Error: AsyncErrorActionConstructor & ActionType,
    ) {

    }
}
export class ActionFactory {
    constructor() {}
    create<Request, Response = void, Async extends boolean = (Response extends void ? false : true)>(
        type: string,
        async: Async = false as Async,
        hasPayload: Request extends void ? false : true = true as Request extends void ? false : true
    ) {
        class AsyncRequestAction extends ActionWithPayload<Request> {
            static type = `${type} @ Z Async Request`;
            constructor(payload: Request, headers: Headers = new Headers()) {
                super(`${type} @ Z Async Request`, (headers.push(new Header(ASYNC_CORRELATION)), headers), payload);
            }
        }
        class AsyncRequestActionWithouPayload extends ActionWithoutPayload {
            static type = `${type} @ Z Async Request`;
            constructor(headers: Headers = new Headers()) {
                super(`${type} @ Z Async Request`, (headers.push(new Header(ASYNC_CORRELATION)), headers));
            }
        }
        class SyncCreateAction extends ActionWithPayload<Request> {
            static type = type;
            constructor(payload: Request, headers: Headers = new Headers()) {
                super(type, headers, payload);
            }
        }
        class SyncCreateActionWithouPayload extends ActionWithoutPayload {
            static type = type;
            constructor(headers: Headers = new Headers()) {
                super(type, headers);
            }
        }
        const AsyncRequestActionSwitchPayload = (hasPayload
            ? AsyncRequestAction
            : AsyncRequestActionWithouPayload) as (Request extends void
                ? AsyncRequestWithoutPayloadActionConstructor & ActionType
                : AsyncRequestActionConstructor<Request> & ActionType);
        const SyncActionSwitchPayload = (hasPayload
            ? SyncCreateAction
            : SyncCreateActionWithouPayload) as (Request extends void
                ? SyncCreateActionWithoutPayloadConstructor & ActionType
                : SyncCreateActionConstructor<Request> & ActionType);
        
        class AsyncResponseAction extends ActionWithPayload<Response> {
            static type = `${type} @ Z Async Response`;
            constructor(payload: Response, async: Header, headers: Headers = new Headers()) {
                super(`${type} @ Z Async Response`, (headers.push(async), headers), payload);
            }
        }
        return (async
            ? new AsyncAction<Request, Response>(
                AsyncRequestActionSwitchPayload,
                AsyncResponseAction as any,
                class AsyncCancelAction extends ActionWithoutPayload {
                    static type = `${type} @ Z Async Cancel`;
                    constructor(async: Header, headers: Headers = new Headers()) {
                        super(`${type} @ Z Async Cancel`, (headers.push(async), headers));
                    }
                },
                class AsyncErrorAction extends ActionWithPayload<Error> {
                    static type = `${type} @ Z Async Error`;
                    constructor(payload: Error, async: Header, headers: Headers = new Headers()) {
                        super(`${type} @ Z Async Error`, (headers.push(async), headers), payload);
                    }
                }
        )
        : new SyncAction<Request>(
            SyncActionSwitchPayload
        )) as Async extends false ? SyncAction<Request> : AsyncAction<Request, Response>;
    }
}

const mainAsyncActionFactory = new ActionFactory();

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
    }
) {
    const Z = new ZStore<State, Schema>(store, selector, initial, config);
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
        ofType(types[0]),
        filter((action: Action<any>) => action.headers.some((header: Header) => header.id === id)),
        map((action: Action<any>) => grabCorrelation
            ? { action, async: action.headers.find((header: Header) => header.id === id) }
            : action
        ),
    );
}
export function withCorrelation(type: string, grabCorrelation: boolean = true) {
    return (...types: string[]) => (actions$: Observable<Action<any>>) => actions$.pipe(
        ofType(types[0]),
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
