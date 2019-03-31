import { Observable } from 'rxjs';
import { Action, Header } from '../../Z';
import { ofType } from '@ngrx/effects';
import { filter } from 'rxjs/operators';

export function findHeader(predicate: (header: Header) => boolean) {
    const hasHeader = ({ headers }: Action<any>) => headers && headers.some(predicate);
    return (actions$: Observable<Action<any>>) => actions$.pipe(filter(hasHeader));
}

export function withHeaderIds(...headerIds: string[]) {
    return findHeader(({ id }: Header) => headerIds.includes(id));
}

export function withHeader(...headerTypes: string[]) {
    return findHeader(({ type }: Header) => headerTypes.includes(type));
}

export function ofTypeWithHeaderId(...actionTypes: string[]) {
    return function (...headerIds: string[]) {
        return (actions$: Observable<Action<any>>) => actions$.pipe(
            ofType(...actionTypes),
            withHeaderIds(...headerIds),
        );
    };
}

export function ofTypeWithHeader(...actionTypes: string[]) {
    return function (...headerTypes: string[]) {
        return (actions$: Observable<Action<any>>) => actions$.pipe(
            ofType(...actionTypes),
            withHeader(...headerTypes),
        );
    };
}

export function WithHeaderIdOfType(...headerIds: string[]) {
    return function (...actionTypes: string[]) {
        return (actions$: Observable<Action<any>>) => actions$.pipe(
            ofType(...actionTypes),
            withHeaderIds(...headerIds),
        );
    }
}

export function WithHeaderOfType(...headerTypes: string[]) {
    return function (...actionTypes: string[]) {
        return (actions$: Observable<Action<any>>) => actions$.pipe(
            ofType(...actionTypes),
            withHeader(...headerTypes),
        );
    }
}
