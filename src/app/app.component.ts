import { Component } from '@angular/core';

import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageStore } from './core/stores/storage/storage.store';
import { Identifiable } from './core/stores/storage/storage.config';
import { filter, distinctUntilKeyChanged, skip, map, mergeMap, defaultIfEmpty } from 'rxjs/operators';
import { pluckPayload } from './core/z/custom-rxjs-operators/maps';
import { AuthStore } from './core/stores/auth/auth.store';
import { asHeaders } from './core/z/core/models';
import { Observable, zip, from, of } from 'rxjs';
import { AppLoading, AppError } from './core/stores/app/app.config';
import { AppStore } from './core/stores/app/app.store';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Todo',
      url: '/todo',
      icon: 'home'
    }
  ];

  L;

  loading$: Observable<[boolean, AppLoading[]]> = zip(this.app.Z.loading, this.app.Z.loadings).pipe(
    distinctUntilKeyChanged(0),
    skip(1),
    mergeMap(([loading, loadings]) => {
      if (loading) {
        return from(this.loadingCtrl.create()).pipe(
          map(el => {
            this.L = el;
            el.present();
            return [loading, loadings] as [boolean, AppLoading[]];
          })
        );
      } else {
        if (this.L) {
          this.L.dismiss();
        }
        return of([loading, loadings] as [boolean, AppLoading[]]);
      }
    })
  );
  error$: Observable<[boolean, AppError[]]> = zip(this.app.Z.error, this.app.Z.errors).pipe(
    distinctUntilKeyChanged(0),
    skip(1),
    mergeMap(([error, errors]) => {
      if (error) {
        return from(this.alertCtrl.create({ message: 'Error' })).pipe(
          map(el => {
            el.present();
            el.onDidDismiss().then(() => this.app.dispatch(new this.app.Z.clearErrors.Create()));
            return [error, errors] as [boolean, AppError[]];
          })
        );
      } else {
        return from(this.alertCtrl.dismiss()).pipe(
          map(() => [error, errors] as [boolean, AppError[]])
        );
      }
    })
  );

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private app: AppStore,
    private storage: StorageStore,
    public auth: AuthStore,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) {
    this.initializeApp();
  }

  private initializeStorage() {
    /**
     * Setup
     */
    const {
      get: { Request: Get },
      save: { Request: Save },
    } = this.storage.Z;
    const headers = asHeaders(['AppComponent@initializeStorage']);
    /**
     * What we will do
     */
    const logic = () => {      
      Get.onResponse(getInstance).pipe(
        pluckPayload(),
        filter(hasNeverBeenTested)
      ).subscribe(registerTest);
      Get.dispatch(getInstance);
      const authenticate = new this.auth.Z.authenticate.Request({
        email: 'test',
        password: 'test '
      });
      this.auth.Z.authenticate.Request.onResponse(authenticate).subscribe(() => {
        this.auth.dispatch(new this.auth.Z.revoke.Request());
      });
      this.auth.dispatch(authenticate);
    }
    /**
     * Whow we will do it
     */
    const getInstance = new Get(headers);
    const hasNeverBeenTested = (entities: Identifiable[]) => !entities.some(entity => entity.id === 'test');
    const registerTest = () => Save.dispatch(new Save([{ id: 'test', value: 'tested !!!' }], headers));
    /**
     * Actualy do it
     */
    logic();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // this.loading$.subscribe();
      // this.error$.subscribe();
      this.initializeStorage();
    });
  }
}
