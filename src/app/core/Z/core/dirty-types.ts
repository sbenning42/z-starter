import { Action, HeadersType } from './types';
import { Headers, Header } from './models';
import { Observable } from 'rxjs';

export interface ActionType {
    type: string;
}
export interface Dispatcher<Payload> {
    dispatch: (action: Action<Payload | void>) => Action<Payload | void>;
}
export interface Notifier<Request, Response> {
    onRequest: (action: Action<Request | void>) => Observable<Action<Request>>;
    onFinish: (action: Action<Request | void>) => Observable<Action<Response | Error>>;
    onResponse: (action: Action<Request | void>) => Observable<Action<Response>>;
    onCancel: (action: Action<Request | void>) => Observable<Action<void>>;
    onError: (action: Action<Request | void>) => Observable<Action<Error>>;
}

export type SyncCreateActionConstructor<Payload> = new (
    payload: Payload,
    headers?: HeadersType
) => Action<Payload>;
export type SyncCreateActionWithoutPayloadConstructor = new (
    headers?: HeadersType
) => Action<void>;

export type AsyncRequestActionConstructor<Request> = new (
    payload: Request,
    headers?: HeadersType
) => Action<Request>;
export type AsyncRequestWithoutPayloadActionConstructor = new (
    headers?: HeadersType
) => Action<void>;
export type AsyncResponseActionConstructor<Request, Response> = new (
    payload: Response,
    request: Action<Request>,
    headers?: HeadersType
) => Action<Response>;
export type AsyncCancelActionConstructor<Request> = new (
    request: Action<Request>,
    headers?: HeadersType
) => Action<void>;
export type AsyncErrorActionConstructor<Request> = new (
    payload: Error,
    request: Action<Request>,
    headers?: HeadersType
) => Action<Error>;

export type ActionSchema<
    Request = void,
    Response = void,
    Async extends boolean = Response extends void ? false : true
> = [Request, Response, Async];

export interface ActionsSchema {
    [x: string]: ActionSchema<any, any, boolean>;
}
