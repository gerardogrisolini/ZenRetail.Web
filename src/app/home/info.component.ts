import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Setting } from 'app/shared/models';
import { Title, Meta } from '@angular/platform-browser';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';

@Component({
    selector: 'app-info',
    styles: [`
      agm-map {
        height: 300px;
      }
      .label-info {
        width: 100px;
        font-weight: bold;
      }
    `],
    templateUrl: 'info.component.html'
})
export class InfoComponent implements OnInit {
    lat: number = 51.678418;
    lng: number = 7.809007;
  
    constructor(
      private titleService: Title,
      private metaService: Meta,
    ) { }
  
    get data(): Setting { return AppComponent.setting; }
  
    async ngOnInit() {
      while (this.data == null) {
        await this.delay(10);
      }
      this.titleService.setTitle(this.data.companyName);
      let description = new MyTranslatePipe().transform(this.data.companyDescription);
      this.metaService.addTag({ name: 'description', content: description }, false);
      AppComponent.setPage('Information');
    }

    private delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
