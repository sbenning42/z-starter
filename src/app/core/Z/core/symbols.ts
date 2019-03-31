export const ASYNC_HEADER = '[Z] Async Header';

export const typeAsRequest = (type: string) => `${type} @ Async Request`;
export const typeAsResponse = (type: string) => `${type} @ Async Response`;
export const typeAsCancel = (type: string) => `${type} @ Async Cancel`;
export const typeAsError = (type: string) => `${type} @ Async Error`;
