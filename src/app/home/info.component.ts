import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Setting } from 'app/shared/models';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { Helpers } from 'app/shared/helpers';

@Component({
  selector: 'app-info',
  styles: [``],
  templateUrl: 'info.component.html'
})
export class InfoComponent implements OnInit {
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
