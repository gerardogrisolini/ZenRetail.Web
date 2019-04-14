import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Setting } from 'app/shared/models';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { Helpers } from 'app/shared/helpers';

@Component({
  	selector: 'app-info',
  styles: [`
    agm-map {
      height: 300px;
    }
  `],
  templateUrl: 'info.component.html'
})
export class InfoComponent implements OnInit {
    lat: number = 51.678418;
    lng: number = 7.809007;
  
    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    get data(): Setting { return Helpers.setting }

    ngOnInit() {
      let name = 'Information';
      let pipe = new MyTranslatePipe(this.platformId);
      let title = pipe.transform(this.data.companyInfoSeo.title, name);
      let description = pipe.transform(this.data.companyInfoSeo.description, name);
      AppComponent.current.setPage(name, title, description, '/media/logo.png');
    }
  }
