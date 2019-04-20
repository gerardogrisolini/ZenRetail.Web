import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BasketService } from 'app/services/basket.service';
import { ProductService } from 'app/services/product.service';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

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
    private router: Router,
    // private titleService: Title,
    // private metaService: Meta,
    public translate: TranslateService,
    private location: Location,
    private basketService: BasketService,
    private productService: ProductService,
    private _element: ElementRef
  ) {
    AppComponent.current = this;
    this.isIframe = this.isFrame();

    if (navigator) {
      const country = navigator.language.substring(0, 2).toLowerCase();
      this.translate.use(country);
    } else {
      this.translate.setDefaultLang('en');
    }
  }

  ngOnInit() {
    if (!this.isIframe) {
      this.loadBasket();
      this.loadCategories();
    }
  }

  onActivate(e, scroller) {
    scroller.scrollTo(0, 0);
  }

  async setPage(
    name: string, 
    // title: string = null, 
    // description: string = null, 
    // image: string = null,
    backButton: boolean = false, 
    menuActive: boolean = true
  ) {
    //console.log('title: ' + title);
    AppComponent.title = await this.translate.get(name).toPromise();
    AppComponent.backButton = backButton;
    AppComponent.menuActive = menuActive;
    
    /*
    this.metaService.removeTag("name='og:title'");
    this.metaService.removeTag("name='og:description'"); 
    this.metaService.removeTag("name='og:type'");
    this.metaService.removeTag("name='og:url'");
    this.metaService.removeTag("name='og:image'");

    if (title !== null) {
      this.titleService.setTitle(title);
      let url = environment.hostWeb + this.router.url;
      this.metaService.addTag({ name: 'og:title', content: title }, false);
      this.metaService.addTag({ name: 'og:type', content: 'website' }, false);
      this.metaService.addTag({ name: 'og:url', content: url }, false);
      if (description !== null) {
        this.metaService.updateTag({ name: 'description', content: description });
        this.metaService.addTag({ name: 'og:description', content: description }, false);
      }
      if (image !== null) {
        this.metaService.addTag({ name: 'og:image', image }, false);
      }
    }
    */
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

  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getItem(key: string) : string {
    return localStorage.getItem(key);
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  count: number = 1;

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
  }

  backClick() {
    this.location.back();
  }
}
