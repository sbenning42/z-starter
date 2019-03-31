import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Header } from '../core/models';
import { Action } from '../core/types';

export function findHeader(predicate: (header: Header) => boolean) {
    return (actions$: Observable<Action<any>>) => actions$.pipe(
        map(action => ({ action, header: action.headers ? action.headers.find(predicate) : null })),
    );
}

export function grabHeaderIds(...headerIds: string[]) {
    return findHeader(({ id }) => headerIds.includes(id));
}

export function grabHeader(...headerTypes: string[]) {
    return findHeader(({ type }) => headerTypes.includes(type));
}
