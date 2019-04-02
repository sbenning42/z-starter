import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  get() {
    const stored = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      stored[key] = JSON.parse(localStorage.getItem(key));
    }
    return of(stored);
  }
  save(entries: { [key: string]: any }) {
    Object.entries(entries).forEach(([key, entry]) => localStorage.setItem(key, JSON.stringify(entry)));
    return of(entries);
  }
  remove(keys: string[]) {
    keys.forEach(key => localStorage.removeItem(key));
    return of(keys);
  }
  clear() {
    localStorage.clear();
    return of({});
  }

}
