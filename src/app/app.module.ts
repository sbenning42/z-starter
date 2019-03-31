import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from './core/core.module';
import { StorageStore } from './stores/storage/storage.store';
import { StorageService } from './core/services/storage/storage.service';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    CoreModule,
    StoreDevtoolsModule.instrument({ maxAge: 100 }),
    EffectsModule.forFeature([
      StorageStore
    ]),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    StorageService,
    StorageStore,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
