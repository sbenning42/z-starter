import { Injectable } from "@angular/core";
import { BaseZ } from 'src/app/core/z/core/base-z';
import {
    StorageSchema,
    STORAGE,
    initialStorage,
    storageActionsConfig,
    storageReducersConfig,
    StorageState
} from './storage.config';
import { Store } from '@ngrx/store';

@Injectable()
export class StorageStore extends BaseZ<StorageState, StorageSchema> {
    constructor(
        public store: Store<any>
    ) {
        super(store, STORAGE, initialStorage, storageActionsConfig, storageReducersConfig);
    }
}
