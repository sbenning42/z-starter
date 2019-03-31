import { Observable } from 'rxjs';
import { Action, Header } from '../../Z';
import { map } from 'rxjs/operators';

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
