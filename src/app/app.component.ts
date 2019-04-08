import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BasketService } from './services/basket.service';
import { ProductService } from './services/product.service';
import { Setting } from 'app/shared/models';
import { Helpers } from 'app/shared/helpers';
import { MyTranslatePipe } from './pipes/mytranslate.pipe';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class AppComponent implements OnInit {
  setting: Setting;
  isIframe = false;
  navItems = [];
  private static title = '';
  private static backButton = false;
  private static menuActive = true;

  public static current: AppComponent;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private translate: TranslateService,
    private location: Location,
    private basketService: BasketService,
    private productService: ProductService,
    private _element: ElementRef
  ) {
    AppComponent.current = this;
    this.isIframe = this.isFrame();
    const country = navigator.language.substring(0, 2).toLowerCase();
    // this language will be used as a fallback when a translation isn't found in the current language
    // this.translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(country);
  }

  setPage(name: string, title: string = '', description: string = '', backButton = false, menuActive = true) {
    //AppComponent.title = name;
    AppComponent.backButton = backButton;
    AppComponent.menuActive = menuActive;
    this.titleService.setTitle(title !== '' ? title : name);
    if (description !== '') {
      this.metaService.addTag({ name: 'description', content: description }, false);
    } else {
      this.metaService.removeTag('description');
    }
    this.translate.get(name).subscribe((res: string) => AppComponent.title = res);
  }

  isFrame(): boolean {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
  }


  get title(): string {
    return AppComponent.title;
  }

  get backButton(): boolean {
    return AppComponent.backButton;
  }

  get menuActive(): boolean {
    return AppComponent.menuActive;
  }

  get itemsCount(): number { return this.basketService.count; }

  ngOnInit() {
    this.loadSetting();
    if (!this.isIframe) {
      this.loadBasket();
      this.loadCategories();
    }
  }

  loadSetting() {
    if (this.setting != null) {
      return;
    }
		this.basketService.getSetting()
        .subscribe(result => {
          this.setting = result;
          Helpers.currency = result.companyCurrency;
          Helpers.utc = result.companyUtc;
        });
  }

  loadCategories() {
    this.productService.getCategories()
      .subscribe(result => {
        result.forEach(p => {
          let name = new MyTranslatePipe().transform(p.translations, p.categoryName);
          this.navItems.push({ name: name, image: '/thumb/' + p.media.name, route: '/category/' + p.seo.permalink })
        });
      });
  }

	loadBasket() {
    const uniqueID = localStorage.getItem('uniqueID');
    if (uniqueID == null) {
      return;
    }
		this.basketService.get()
			.subscribe(result => {
				this.basketService.basket = result;
			});
	}

  toggleFullscreen() {
    const elem = this._element.nativeElement.querySelector('.app-content');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }

    // const element = document as any;
    // if (element.exitFullscreen) {
    //     element.exitFullscreen();
    // } else if (element.mozCancelFullScreen) {
    //     element.mozCancelFullScreen();
    // } else if (element.webkitExitFullscreen) {
    //     element.webkitExitFullscreen();
    // } else if (element.msExitFullscreen) {
    //     element.msExitFullscreen();
    // }
  }

  backClick() {
    this.location.back();
  }
}
