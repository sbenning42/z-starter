import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { InMemoryWebApiModule } from 'angular-in-memory-web-api';

import { InMemoryDataService } from './in-memory-data.service';
import { TodoService } from './services/todo/todo.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthService } from './mocks/auth/auth.service';
import { StorageService } from './services/storage/storage.service';
import { StorageStore } from './stores/storage/storage.store';
import { AuthStore } from './stores/auth/auth.store';
import { AppStore } from './stores/app/app.store';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 6000 }),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([
      StorageStore,
      AuthStore,
      AppStore
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 100 }),
  ],
  providers: [
    TodoService,
    StorageService,
    AuthService,
    StorageStore,
    AuthStore,
    AppStore
  ]
})
export class CoreModule { }
