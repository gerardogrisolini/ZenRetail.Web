import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ArticleItem } from '../shared/models';

@Injectable()
export class ImportService {

    constructor(private http: HttpClient) {
    }

    getQuantity(barcode: string): Observable<ArticleItem> {
        return this.http.get<ArticleItem>('/ecommerce/sync?barcode=' + barcode);
    }
}
