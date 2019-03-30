import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { TodoStore } from './todo.store';
import { StorageStore } from './storage.store';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([
      TodoStore,
      StorageStore
    ]),
  ],
  providers: [
    TodoStore,
    StorageStore
  ]
})
export class StateModule { }
