import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Setting } from 'app/shared/models';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { Helpers } from 'app/shared/helpers';

@Component({
  selector: 'app-info',
  styles: [``],
  templateUrl: 'info.component.html'
})
export class InfoComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    let pipe = new MyTranslatePipe(this.platformId);
    let title = pipe.transform(this.data.companyInfoSeo.title);
    let description = pipe.transform(this.data.companyInfoSeo.description);
    AppComponent.current.setPage('Information', title, description, '/media/logo.png');
  }

  get data(): Setting { return Helpers.setting }
}
