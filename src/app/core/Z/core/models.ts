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
    Dispatcher
} from './dirty-types';

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
    ) {}
}
