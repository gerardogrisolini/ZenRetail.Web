import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ArticleItem } from '../shared/models';

@Injectable()
export class ImportService {

    constructor(private http: HttpClient) {
    }

    getQuantity(barcode: string): Observable<ArticleItem> {
        return this.http.get<ArticleItem>('http://www.grisolini.com:8080/webretail/ecommerce/sync?barcode=' + barcode);
    }
}
