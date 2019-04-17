import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from 'app/services/product.service';
import { BasketService } from 'app/services/basket.service';
import { Product, Article, Basket } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ParseUrlPipe } from 'app/pipes/parseurl.pipe';

@Component({
	selector: 'app-product',
	templateUrl: 'app.product.html',
	styleUrls: ['app.product.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
	private sub: any;
	product: Product;
	
	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private router: Router,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
		private productService: ProductService,
		private basketService: BasketService,
		private activatedRoute: ActivatedRoute
	) {	
		if (isPlatformBrowser(this.platformId)) {
      this.resize(window.innerWidth);
    }
    if (isPlatformServer(this.platformId)) {
      this.resize(600);
    }
	}
	
	config: SwiperOptions = {
		//autoHeight: true,
		//autoplay: 3000, // Autoplay option having value in milliseconds
		effect: 'coverflow',
		grabCursor: true,
		centeredSlides: true,
		slidesPerView: 2, // Slides Visible in Single View Default is 1
		spaceBetween: 30 // Space between each Item
	};
	  
	get isIframe(): boolean { return AppComponent.current.isIframe; }
	get isServer(): boolean { return isPlatformServer(this.platformId) }

	ngOnInit() {
		if (AppComponent.current.getItem('barcode')) {
			this.pickerClick(null);
		}
		this.sub = this.activatedRoute.params.subscribe(params => {
			const name = params['name'];
			this.loadProduct(name);
		});
	}

  ngOnDestroy() {
		// Clean sub to avoid memory leak
		this.sub.unsubscribe();
  }
	
	private resize(w: number) {
		this.config.slidesPerView = w < 600 ? 1 : w < 1200 ? 2 : 3;
	}

  addMetaData(product: Product) {
		let pipe = new MyTranslatePipe(this.platformId);
    let brand = pipe.transform(product.brand.translations, product.brand.brandName);
    let name = pipe.transform(product.translations, product.productName);
    let title = pipe.transform(product.seo.title, product.productName + ' - ' + brand);
		let description = pipe.transform(product.seo.description);
		let image = new ParseUrlPipe().transform(product.medias, 'thumb')
    AppComponent.current.setPage("Product", title, description, image, !this.isIframe, !this.isIframe);
}

  loadProduct(name: string) {
		this.productService.getByProductName(name)
			.subscribe(result => {
				this.product = result;
				if (!this.isIframe) {
					this.addMetaData(result);
				} else if (isPlatformBrowser(this.platformId)) {
					const height = (result.attributes.length * 100) + 160;
					window.parent.postMessage('iframe:' + height, '*');
				}
			}, 
			onerror => {
				this.translate.get('Close').subscribe((res: string) =>
					this.snackBar.open(onerror.status === 401 ? '401 - Unauthorized' : onerror._body, res)
				);
			});
  	}

	pickerClick(event: Article) {
		const model = new Basket();
		if (event !== null) {
			model.basketBarcode = event.barcodes.find(p => p.tags.length === 0).barcode;
			AppComponent.current.setItem('barcode', model.basketBarcode);
		} else {
			model.basketBarcode = AppComponent.current.getItem('barcode');
		}
		this.basketService
			.create(model)
			.subscribe(result => {
				AppComponent.current.removeItem('barcode');
				this.translate.get('added to basket!')
					.subscribe((message: string) => {
						this.translate.get('Show Basket')
							.subscribe((action: string) => {
								this.snackBar.open(model.basketBarcode + ' ' + message, action, {
									duration: 5000
								})
								.onAction()
								.subscribe(() => {
									if (isPlatformBrowser(this.platformId) && this.isIframe) {
											window.parent.postMessage('basket', '*');
									} else {
										this.router.navigate(['basket']);
									}
								});
							});
					});
				if (!this.isIframe) {
				const basket = this.basketService.basket.find(p => p.basketBarcode === model.basketBarcode);
				if (basket) {
					basket.basketQuantity += 1.0;
				} else {
					this.basketService.basket.push(result);
					}
				} else if (isPlatformBrowser(this.platformId)) {
					window.parent.postMessage('token:' + AppComponent.current.getItem('token'), '*');
				}
			},
			onerror => {
				this.translate.get('You must login before adding to basket')
					.subscribe((message: string) => {
						this.translate.get('Login')
							.subscribe((login: string) => {
								this.snackBar.open(onerror.status === 401 ? message : onerror._body, login)
									.onAction()
									.subscribe(() => {
										AppComponent.current.setItem('origin', this.router.url);
										this.router.navigate(['login']);
									});
							});
					});
			});
	}
}
