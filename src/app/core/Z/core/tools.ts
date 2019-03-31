import * as UUID from 'uuid/v4';
import { Headers, Header } from './models';

export function uuid(): string {
    return UUID();
}

export function attachHeader(headers: Headers, ...toAttach: Header[]) {
    headers.push(...toAttach);
    return headers;
}
