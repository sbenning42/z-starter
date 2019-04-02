import { uuid } from './tools';
import {
    SyncCreateActionWithoutPayloadConstructor,
    SyncCreateActionConstructor,
    AsyncRequestWithoutPayloadActionConstructor,
    AsyncRequestActionConstructor,
    AsyncResponseActionConstructor,
    AsyncCancelActionConstructor,
    AsyncErrorActionConstructor,
    ActionType,
    Dispatcher,
    Notifier
} from './dirty-types';
import { HeadersType } from './types';

export class Header<Data = any> {
    id = uuid();
    constructor(
        public type: string,
        public data: Data = {} as any,
    ) {}
}
export type Headers = Array<Header>;
export class ActionWithPayload<Payload> {
    headers: Headers;
    constructor(
        public type: string,
        headers: HeadersType = [],
        public payload: Payload,
    ) {
        this.headers = asHeaders(headers);
    }
}
export class ActionWithoutPayload {
    headers: Headers;
    constructor(
        public type: string,
        headers: HeadersType = [],
    ) {
        this.headers = asHeaders(headers);
    }
}

export class SyncAction<Payload> {
    constructor(
        public Create: Payload extends void
            ? SyncCreateActionWithoutPayloadConstructor & ActionType & Dispatcher<void> & Notifier<any, any>
            : SyncCreateActionConstructor<Payload> & ActionType & Dispatcher<Payload> & Notifier<any, any>,
    ) {}
}

export class AsyncAction<Request, Response> {
    constructor(
        public Request: Request extends void
            ? AsyncRequestWithoutPayloadActionConstructor & ActionType & Dispatcher<void> & Notifier<void, Response>
            : AsyncRequestActionConstructor<Request> & ActionType & Dispatcher<Request> & Notifier<Request, Response>,
        public Response: AsyncResponseActionConstructor<Request, Response> & ActionType & Dispatcher<Response>,
        public Cancel: AsyncCancelActionConstructor<Request> & ActionType & Dispatcher<void>,
        public Error: AsyncErrorActionConstructor<Request> & ActionType & Dispatcher<Error>,
    ) {}
}
export function attachHeader(headers: Headers, ...toAttach: Header[]) {
    return [...headers, ...toAttach];
}

export function asHeaders(headers: HeadersType) {
    return headers.filter(header => header !== undefined && header !== null).map(header => {
        if (typeof(header) === 'string') {
            return new Header(header);
        } else if (header['id'] === undefined) {
            return new Header(header.type, header.data);
        } else {
            return header as Header;
        }
    });
}

export function findHeader(predicate: (header: Header) => boolean) {
    return function ({ headers }: ActionWithPayload<any> | ActionWithoutPayload) {
        return headers && headers.filter(header => !!header).some(predicate);
    };
}
export function getHeader(predicate: (header: Header) => boolean) {
    return function ({ headers }: ActionWithPayload<any> | ActionWithoutPayload) {
        return headers && headers.filter(header => !!header).find(predicate);
    };
}
export function hasHeaderId(...headerIds: string[]) {
    return findHeader((header: Header) => headerIds.includes(header.id));    
}
export function hasHeader(...headerTypes: string[]) {
    return findHeader((header: Header) => headerTypes.includes(header.type));
}
export function grabHeaderId(...headerIds: string[]) {
    return getHeader((header: Header) => headerIds.includes(header.id));    
}
export function grabHeader(...headerTypes: string[]) {
    return getHeader((header: Header) => headerTypes.includes(header.type));
}

