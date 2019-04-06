import { Injectable } from '@angular/core';
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
//import { environment } from 'environments/environment';

@Injectable()
export class UrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf('i18n') < 0) {
      // if (!environment.production) {
      //   req = req.clone({ url: 'http://localhost:8080' + req.url });
      //   console.log(req.url);
      // }
      req = req.clone({ headers: req.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`) });
    }
    // req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    // req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
    return next.handle(req);
  }
}
