import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Setting } from 'app/shared/models';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';

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
  
    get data(): Setting { return AppComponent.current.setting; }
  
    async ngOnInit() {
      while (this.data == null) {
        await this.delay(10);
      }
      let title = new MyTranslatePipe(this.platformId).transform(this.data.companySeo.title);
      let description = new MyTranslatePipe(this.platformId).transform(this.data.companySeo.description);
      AppComponent.current.setPage('Information', title, description);
    }

    private delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
