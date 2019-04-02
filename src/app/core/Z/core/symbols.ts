export const ASYNC_HEADER = '[Z] Async Header';
export const ASYNC_REQUEST = ' @ Async Request';
export const ASYNC_RESPONSE = ' @ Async Response';
export const ASYNC_CANCEL = ' @ Async Cancel';
export const ASYNC_ERROR = ' @ Async Error';

export const typeAsRequest = (type: string) => `${type}${ASYNC_REQUEST}`;
export const typeAsResponse = (type: string) => `${type}${ASYNC_RESPONSE}`;
export const typeAsCancel = (type: string) => `${type}${ASYNC_CANCEL}`;
export const typeAsError = (type: string) => `${type}${ASYNC_ERROR}`;

export const isARequestType = (type: string) => type.includes(ASYNC_REQUEST);
export const isAResponseType = (type: string) => type.includes(ASYNC_RESPONSE);
export const isACancelType = (type: string) => type.includes(ASYNC_CANCEL);
export const isAnErrorType = (type: string) => type.includes(ASYNC_ERROR);

