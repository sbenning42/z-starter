import * as UUID from 'uuid/v4';
import { Store, select, createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';

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
export class Action<Payload> {
    constructor(
        public type: string,
        public payload: Payload,
        public headers: Headers = new Headers()
    ) {}
}
export interface ActionType {
    type: string;
}

export type SyncCreateActionConstructor<Payload> = new (payload: Payload, headers?: Headers) => Action<Payload>;
export type AsyncRequestActionConstructor<Request> = new (payload: Request, headers?: Headers) => Action<Request>;
export type AsyncResponseActionConstructor<Response> = new (payload: Response, async: Header, headers?: Headers) => Action<Response>;
export type AsyncCancelActionConstructor = new (async: Header, headers?: Headers) => Action<undefined>;
export type AsyncErrorActionConstructor = new (payload: Error, async: Header, headers?: Headers) => Action<Error>;

export class SyncAction<Payload> {
    constructor(
        public Create: SyncCreateActionConstructor<Payload> & ActionType,
    ) {}
}

export class AsyncAction<Request, Response> {
    constructor(
        public Request: AsyncRequestActionConstructor<Request> & ActionType,
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
        async: Async = false as Async
    ) {
        return (async
            ? new AsyncAction<Request, Response>(
                class AsyncRequestAction extends Action<Request> {
                    static type = `${type} @ Z Request`;
                    constructor(payload: Request, headers: Headers = new Headers()) {
                        super(`${type} @ Z Async Request`, payload, (headers.push(new Header(ASYNC_CORRELATION)), headers));
                    }
                },
                class AsyncResponseAction extends Action<Response> {
                    static type = `${type} @ Z Async Response`;
                    constructor(payload: Response, async: Header, headers: Headers = new Headers()) {
                        super(`${type} @ Z Async Response`, payload, (headers.push(async), headers));
                    }
                },
                class AsyncCancelAction extends Action<undefined> {
                    static type = `${type} @ Z Async Cancel`;
                    constructor(async: Header, headers: Headers = new Headers()) {
                        super(`${type} @ Z Async Cancel`, undefined, (headers.push(async), headers));
                    }
                },
                class AsyncErrorAction extends Action<Error> {
                    static type = `${type} @ Z Async Error`;
                    constructor(payload: Error, async: Header, headers: Headers = new Headers()) {
                        super(`${type} @ Z Async Error`, payload, (headers.push(async), headers));
                    }
                }
        )
        : new SyncAction<Request>(
            class SyncCreateAction extends Action<Request> {
                static type = type;
                constructor(payload: Request, headers: Headers = new Headers()) {
                    super(type, payload, headers);
                }
            }
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
            [Key in keyof Schema]: string | { type: string, async: Schema[Key]['2'] };
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
                    ? mainAsyncActionFactory.create(thisConfig, false)
                    : mainAsyncActionFactory.create(thisConfig.type, thisConfig.async),
            }), {}),
        } as any;
    }
}

export function createZStore<State, Schema extends ZSchema>(
    store: Store<any>,
    selector: string,
    initial: State,
    config: {
        [Key in keyof Schema]: string | { type: string, async: Schema[Key]['2'] };
    }
) {
    const Z = new ZStore<State, Schema>(store, selector, initial, config);
    return {
        _config: Z.config,
        _initial: Z.initial,
        ...Z['Z'],
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
            [Key in keyof Schema]: string | { type: string, async: Schema[Key]['2'] };
        },
        _initial: State,
    };
}

export function syncConfig(type: string) {
    return type;
}
export function asyncConfig(type: string) {
    return { type , async: true as true };
}
