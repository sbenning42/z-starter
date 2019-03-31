import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageStore } from './storage.store';
import { Identifiable } from './storage.config';

export class SomeStorageConsumerComponent implements OnInit {

    loaded$: Observable<boolean> = this.storage.Z.loaded;
    
    entities$: Observable<Identifiable[]> = this.storage.Z.entities.pipe(
        map(entities => Object.values(entities))
    );

    uiTemplate = `
    <section>
        <h1>Storage</h1>
        <h2>Save Entry</h2>
        <input #key type="text" placeholder="key">
        <input #value type="text" placeholder="Value">
        <button [disabled]="!(key.value && value.value)" (click)="saveInStorage(key.value, value.value)">Save</button>
        <h2>Entries</h2>
        <ul>
            <li *ngFor="let entry of entities$|async" (click)="removeFromStorage(entry.id)">{{ entry|json }}</li>
        </ul>
        <h2>Actions</h2>
        <button [disabled]="loaded$|async" (click)="getStorage()">Get</button>
        <button (click)="clearStorage()">Clear</button>
    </section>
    `;

    constructor(public storage: StorageStore) {}
    
    ngOnInit() {
        this.getStorage();
    }

    getStorage() {
        const { Request } = this.storage.Z.get;
        Request.dispatch(new Request());
    }

    saveInStorage(...identifiables: Identifiable[]) {
        const { Request } = this.storage.Z.save;
        Request.dispatch(new Request(identifiables));
    }

    removeFromStorage(...ids: string[]) {
        const { Request } = this.storage.Z.remove;
        Request.dispatch(new Request(ids));
    }

    clearStorage() {
        const { Request } = this.storage.Z.clear;
        Request.dispatch(new Request());
    }

}
