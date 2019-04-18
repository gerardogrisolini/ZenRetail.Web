import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { Setting } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { Helpers } from 'app/shared/helpers';
import { environment } from 'environments/environment';

@Injectable()
export class AppLoadService {

  constructor(private httpClient: HttpClient) { }

  // initializeApp(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //         console.log(`initializeApp:: inside promise`);

  //         setTimeout(() => {
  //           console.log(`initializeApp:: inside setTimeout`);
  //           // doing something

  //           resolve();
  //         }, 3000);
  //       });
  // }

  async getSettings(): Promise<Setting> {
    const settings = await this.httpClient
      .get<Setting>('/api/ecommerce/setting')
      .toPromise();
    
    // console.log(`Settings from API: `, settings);

    Helpers.setting = settings;
    Helpers.currency = settings.companyCurrency;
    Helpers.utc = settings.companyUtc;

    return settings;
  }
}