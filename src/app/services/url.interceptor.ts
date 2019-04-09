import { Injectable } from '@angular/core';
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { AppComponent } from 'app/app.component';
import { environment } from 'environments/environment';

@Injectable()
export class UrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf('i18n') < 0) {
      req = req.clone({ url: environment.hostApi + req.url });
      req = req.clone({ headers: req.headers.set('Authorization', `Bearer ${AppComponent.current.getItem('token')}`) });
    }
    // req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    // req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
    return next.handle(req);
  }
}
