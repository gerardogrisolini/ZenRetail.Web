import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Login, Token } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class SessionService {

    username: string;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router,
        private http: HttpClient) {
    }

    login(account: Login): Observable<Token> {
        return this.http.post<Token>('/api/login', account);
    }

    logout() {
        const body = { token: AppComponent.current.getItem('token') };
        this.http.post<any>('/api/logout', body).subscribe(result => result);
        this.removeCredentials();
    }

    register(account: Login): Observable<Token> {
        return this.http.post<Token>('/api/register', account);
    }

    grantCredentials(username: string, data: Token) {
        if (isPlatformBrowser(this.platformId)) {
            window.parent.postMessage('token:' + data.bearer, '*');
        }
        this.username = username;
        AppComponent.current.setItem('username', username);
        // AppComponent.current.setItem('uniqueID', data.uniqueID);
        AppComponent.current.setItem('token', data.bearer);
        AppComponent.current.setItem('role', "Registry");

        const origin = AppComponent.current.getItem('origin');
        this.router.navigate([origin ? origin : 'basket']);
        AppComponent.current.removeItem('origin');
    }

    removeCredentials() {
        if (isPlatformBrowser(this.platformId)) {
            window.parent.postMessage('token:', '*');
        }
        AppComponent.current.removeItem('origin');
        AppComponent.current.removeItem('uniqueID');
        AppComponent.current.removeItem('token');
        AppComponent.current.removeItem('role');
        this.router.navigate(['login']);
    }

    get isAuthenticated(): boolean {
        return AppComponent.current.getItem('token') != null && AppComponent.current.getItem('role') === 'Registry';
    }

    checkCredentials(): boolean {
        if (!this.isAuthenticated) {
            this.removeCredentials();
            return false;
        }
        return true;
    }

    getCredentials(): Observable<any>  {
        return this.http.get<any>('/api/authenticated');
    }
}
