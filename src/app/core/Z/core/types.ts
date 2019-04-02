import { ActionWithoutPayload, ActionWithPayload, Headers, Header } from './models';
import { ActionsSchema, ActionSchema } from './dirty-types';

export type HeadersType = (string | Header | { type: string, data?: any })[];

export type Action<Payload> = Payload extends void ? ActionWithoutPayload : ActionWithPayload<Payload>;

export type Schemas = ActionsSchema;
export type Schema<
    Request = void,
    Response = void,
    Async extends boolean = Response extends void ? false : true
> = ActionSchema<Request, Response, Async>;
