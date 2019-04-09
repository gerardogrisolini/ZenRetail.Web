import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from 'app/services/product.service';
import { BasketService } from 'app/services/basket.service';
import { Product, Article, Basket } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { isPlatformBrowser } from '@angular/common';

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
	) {	}

	config: SwiperOptions = {
		autoplay: 3000, // Autoplay option having value in milliseconds
		initialSlide: 1, // Slide Index Starting from 0
		slidesPerView: 1, // Slides Visible in Single View Default is 1
		pagination: '.swiper-pagination', // Pagination Class defined
		paginationClickable: true, // Making pagination dots clicable
		nextButton: '.swiper-button-next', // Class for next button
		prevButton: '.swiper-button-prev', // Class for prev button
		spaceBetween: 0 // Space between each Item
	};
	  
	get isIframe(): boolean { return AppComponent.current.isIframe; }

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
  
  addMetaData(product: Product) {
		let pipe = new MyTranslatePipe(this.platformId);
    let name = pipe.transform(product.translations, product.productName);
    let title = pipe.transform(product.seo.title, name);
    let description = pipe.transform(product.seo.description, name);
    //this.metaService.removeTag('name="description"');
    AppComponent.current.setPage(name, title, description, !this.isIframe, !this.isIframe);
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
