import { Component, OnInit, ElementRef, ViewEncapsulation, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Location } from '@angular/common';
import { MetaService } from '@ngx-meta/core';
import { TranslateService } from '@ngx-translate/core';
import { BasketService } from 'app/services/basket.service';
import { ProductService } from 'app/services/product.service';
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
  isIframe = false;
  navItems = [];
  private static title = '';
  private static backButton = false;
  private static menuActive = true;

  public static current: AppComponent;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private readonly metaService: MetaService,
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

  ngOnInit() {
    if (!this.isIframe) {
      this.loadBasket();
      this.loadCategories();
    }
  }

  async setPage(
    name: string, 
    title: string = null, 
    description: string = null, 
    image: string = null,
    backButton: boolean = false, 
    menuActive: boolean = true
  ) {
    //console.log('title: ' + title);
    AppComponent.title = await this.translate.get(name).toPromise();
    AppComponent.backButton = backButton;
    AppComponent.menuActive = menuActive;
    
    this.metaService.removeTag("property='description'");
    this.metaService.removeTag("property='og:title'");
    this.metaService.removeTag("property='og:description'"); 
    this.metaService.removeTag("property='og:type'");
    this.metaService.removeTag("property='og:url'");
    this.metaService.removeTag("property='og:image'");
    
    if (title !== null) {
      this.metaService.setTitle(title);
      let url = environment.hostWeb + this.router.url;
      this.metaService.setTag('og:title', title);
      this.metaService.setTag('og:type', 'website');
      this.metaService.setTag('og:url', url);
      if (description !== null) {
        this.metaService.setTag('description', description);
        this.metaService.setTag('og:description', description);
      }
      if (image !== null) {
        this.metaService.setTag('og:image', image);
      }
    }
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
  count: number = 1;

  // async loadSetting() {
  //   this.count = this.count + 1;
  //   console.log(this.count);
  //   if (AppComponent.setting !== null) { return; }
  //   AppComponent.setting = await this.basketService.getSetting().toPromise();
  //   console.log(AppComponent.setting);
  //   Helpers.currency = AppComponent.setting.companyCurrency;
  //   Helpers.utc = AppComponent.setting.companyUtc;
  // }

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
    const uniqueID = this.getItem('uniqueID');
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
