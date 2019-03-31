import { ActionWithoutPayload, ActionWithPayload } from './models';
import { ActionsSchema, ActionSchema } from './dirty-types';

export type Action<Payload> = Payload extends void ? ActionWithoutPayload : ActionWithPayload<Payload>;

export type Schemas = ActionsSchema;
export type Schema<
    Request = void,
    Response = void,
    Async extends boolean = Response extends void ? false : true
> = ActionSchema<Request, Response, Async>;
