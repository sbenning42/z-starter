import { Observable } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { filter } from 'rxjs/operators';
import { Header } from '../core/models';
import { Action } from '../core/types';

export function findHeader(predicate: (header: Header) => boolean) {
    const hasHeader = ({ headers }: Action<any>) => headers && headers.filter(header => !!header).some(predicate);
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
