import { Injectable } from "@angular/core";
import { BaseZ } from 'src/app/core/z/core/base-z';
import { AppState, AppSchema, APP, initialApp, appActions, appReducers, AppLoading } from './app.config';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from 'src/app/core/z/core/types';
import { withLatestFrom, filter, map, mergeMap, distinctUntilChanged, skip, tap, distinctUntilKeyChanged, switchMap, bufferCount, concatMap } from 'rxjs/operators';
import { ASYNC_HEADER, isARequestType, isAnErrorType } from '../../z/core/symbols';
import { grabHeader } from '../../z/custom-rxjs-operators/maps';
import { concat, of, from, EMPTY } from 'rxjs';
import { LoadingController, AlertController } from '@ionic/angular';

@Injectable()
export class AppStore extends BaseZ<AppState, AppSchema> {

    errorEl = undefined;
    loadingEl: Promise<HTMLIonLoadingElement> = undefined;
i = 0
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
    ) {
        super(store, actions$, APP, initialApp, appActions, appReducers);
    }

    @Effect({ dispatch: true })
    protected handleAsyncsEffect$ = this.actions$.pipe(
        grabHeader('@load'),
        filter(({ action }) => isARequestType(action.type)),
        mergeMap(({ action: request, header: load }) => {
            const async = request.headers.find(header => header.type === ASYNC_HEADER);
            const loadStart = new this.Z.loadStart.Create(async);
            const loadSop = new this.Z.loadStop.Create(async);
            const requestFinish$ = this.Z.loadStart.Create.onFinish(request);
            const onError = (err: Error) => new this.Z.errStart.Create({ ...async, ...err });
            return concat(of(loadStart), requestFinish$.pipe(
                mergeMap(finish => isAnErrorType(finish.type)
                    ? [loadSop, onError(finish['payload'])]
                    : [loadSop]
                ),
            ));
        })
    );

    @Effect({ dispatch: false })
    protected uiLoadEffect$ = this.Z.loading.pipe(
        withLatestFrom(this.Z.loadings),
        distinctUntilKeyChanged(0),
        skip(1),
        concatMap(([loading, loadings]) => from(
            loading
                ? this.loadingCtrl.create(loadings[0]).then(el => el.present().then(() => el))
                : [undefined]
        )),
        bufferCount(2),
        tap(([el]) => {
            el.dismiss();
        })
    );

    @Effect({ dispatch: true })
    protected startLoadingEffect$ = this.actions$.pipe(
        ofType(this.Z.loadStart.Create.type),
        withLatestFrom(this.Z.loadings),
        filter(([, loadings]) => loadings.length === 1),
        map(() => new this.Z.startLoading.Create()),
    );
    @Effect({ dispatch: true })
    protected stopLoadingEffect$ = this.actions$.pipe(
        ofType(this.Z.loadStop.Create.type),
        withLatestFrom(this.Z.loadings),
        filter(([, loadings]) => loadings.length === 0),
        map(() => new this.Z.stopLoading.Create()),
    );
    
    @Effect({ dispatch: true })
    protected startErrorEffect$ = this.actions$.pipe(
        ofType(this.Z.errStart.Create.type),
        withLatestFrom(this.Z.errors),
        filter(([, errors]) => errors.length === 1),
        map(() => new this.Z.startError.Create()),
    );
    @Effect({ dispatch: true })
    protected stopErrorEffect$ = this.actions$.pipe(
        ofType(this.Z.errStop.Create.type),
        withLatestFrom(this.Z.errors),
        filter(([, errors]) => errors.length === 0),
        map(() => new this.Z.stopError.Create()),
    );

}
