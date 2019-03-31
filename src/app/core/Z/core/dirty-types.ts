import { Action } from './types';
import { Headers, Header } from './models';

export interface ActionType {
    type: string;
}
export interface Dispatcher<Payload> {
    dispatch: (action: Action<Payload | void>) => Action<Payload | void>;
}

export type SyncCreateActionConstructor<Payload> = new (
    payload: Payload,
    headers?: Headers
) => Action<Payload>;
export type SyncCreateActionWithoutPayloadConstructor = new (
    headers?: Headers
) => Action<void>;

export type AsyncRequestActionConstructor<Request> = new (
    payload: Request,
    headers?: Headers
) => Action<Request>;
export type AsyncRequestWithoutPayloadActionConstructor = new (
    headers?: Headers
) => Action<void>;
export type AsyncResponseActionConstructor<Response> = new (
    payload: Response,
    async: Header,
    headers?: Headers
) => Action<Response>;
export type AsyncCancelActionConstructor = new (
    async: Header,
    headers?: Headers
) => Action<void>;
export type AsyncErrorActionConstructor = new (
    payload: Error,
    async: Header,
    headers?: Headers
) => Action<Error>;

export type ActionSchema<
    Request = void,
    Response = void,
    Async extends boolean = Response extends void ? false : true
> = [Request, Response, Async];

export interface ActionsSchema {
    [x: string]: ActionSchema<any, any, boolean>;
}
