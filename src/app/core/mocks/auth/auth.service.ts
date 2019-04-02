import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { uuid } from '../../z/core/tools';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userUrl = 'api/users';
  private auths: { user: any, token: string }[] = [];
  constructor(private httpClient: HttpClient) {}
  register(user: Partial<{ id: string, email: string, password: string }>) {
    return this.httpClient.post<{ id: string, email: string, password?: string }>(this.userUrl, user);
  }
  authenticate(credentials: { email: string, password: string }) {
    return this.httpClient.get<{ id: string, email: string, password?: string }[]>(this.userUrl).pipe(
      switchMap(users => {
        const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (!user) {
          return throwError(new Error('Wrong credentials'));
        }
        const auth = { user, token: uuid() };
        this.auths.push(auth);
        return of(auth);
      }),
    );
  }
  revoke(token: string) {
    this.auths = this.auths.filter(auth => auth.token !== token);
    return of({});
  }
}
