import { Component, OnInit, ElementRef, ViewEncapsulation, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BasketService } from 'app/services/basket.service';
import { ProductService } from 'app/services/product.service';
import { Setting } from 'app/shared/models';
import { Helpers } from 'app/shared/helpers';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Component({
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    public translate: TranslateService,
    private location: Location,
    private basketService: BasketService,
    private productService: ProductService,
    private _element: ElementRef
  ) {
    AppComponent.current = this;
    this.isIframe = this.isFrame();

    if (isPlatformBrowser(this.platformId)) {
      const country = navigator.language.substring(0, 2).toLowerCase();
      this.translate.use(country);
    }
    if (isPlatformServer(this.platformId)) {
      this.translate.setDefaultLang('en');
    }
  }

  setPage(
    name: string, 
    title: string = null, 
    description: string = null, 
    image: string = null,
    backButton: boolean = false, 
    menuActive: boolean = true
  ) {
    this.titleService.setTitle(title !== null ? title : name);
    this.metaService.removeTag("name='description'");
    this.metaService.removeTag("name='og:title'");
    this.metaService.removeTag("name='og:description'"); 
    this.metaService.removeTag("name='og:type'");
    this.metaService.removeTag("name='og:url'");
    this.metaService.removeTag("name='og:image'");
    if (title !== null) {
      let url = environment.hostWeb + this.router.url;
      this.metaService.addTag({ name: 'og:title', content: title }, false);
      this.metaService.addTag({ name: 'og:type', content: 'website' }, false);
      this.metaService.addTag({ name: 'og:url', content: url }, false);
      if (description !== null) {
        this.metaService.addTag({ name: 'description', content: description }, false);
        this.metaService.addTag({ name: 'og:description', content: description }, false);
      }
      if (image !== null) {
        this.metaService.addTag({ name: 'og:image', image }, false);
      }
    }
    AppComponent.backButton = backButton;
    AppComponent.menuActive = menuActive;
    this.translate.get(name).subscribe((res: string) => AppComponent.title = res, () => AppComponent.title = name);
  }

  isFrame(): boolean {
    if (isPlatformServer(this.platformId)) {
      return false;
    }
    if (isPlatformBrowser(this.platformId)) {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
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

  setItem(key: string, value: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  getItem(key: string) : string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    } else {
      return null;
    }
  }

  removeItem(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
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
          let name = new MyTranslatePipe(this.platformId).transform(p.translations, p.categoryName);
          this.navItems.push({ name: name, image: environment.hostApi + '/thumb/' + p.media.name, route: '/category/' + p.seo.permalink })
        });
      });
  }

	loadBasket() {
    const uniqueID = AppComponent.current.getItem('uniqueID');
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
