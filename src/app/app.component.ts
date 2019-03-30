import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageStore } from './state/storage.store';
import { ActionsService } from './core/services/actions/actions.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    },
    {
      title: 'Todo',
      url: '/todo',
      icon: 'todo'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: StorageStore,
    public actions: ActionsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    const { GetStorage } = this.actions.Z;
    this.platform.ready().then(() => {
      this.storage.dispatch(new GetStorage())
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
