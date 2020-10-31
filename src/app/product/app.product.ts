import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from 'app/services/product.service';
import { BasketService } from 'app/services/basket.service';
import { Product, Article, Basket } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { ImportService } from 'app/services/import.service';
import { SwiperOptions } from 'swiper';

@Component({
	selector: 'app-product',
	templateUrl: 'app.product.html',
	styleUrls: ['app.product.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
	private sub: any;
	product: Product;
	
	constructor(
		private router: Router,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
		private productService: ProductService,
		private basketService: BasketService,
		private activatedRoute: ActivatedRoute,
		private importService: ImportService
	) {
		this.resize(window.innerWidth);
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

	ngOnInit() {
		this.sub = this.activatedRoute.params.subscribe(params => {
			const name = params['name'];
			this.loadProduct(name);
		});
		if (AppComponent.current.getItem('barcode')) {
			this.pickerClick(null);
		}
	}

  ngOnDestroy() {
		// Clean sub to avoid memory leak
		this.sub.unsubscribe();
  }
	
	private resize(w: number) {
		this.config.slidesPerView = w < 600 ? 1 : w < 1200 ? 2 : 3;
	}

  addMetaData(product: Product) {
		// let pipe = new MyTranslatePipe(this.platformId);
    // let title = pipe.transform(product.seo.title);
		// let description = pipe.transform(product.seo.description);
		// let image = new ParseUrlPipe().transform(product.medias, 'thumb')
    AppComponent.current.setPage('Product', !this.isIframe, !this.isIframe);
}

  loadProduct(name: string) {
		this.productService.getByProductName(name)
			.subscribe(result => {
				this.product = result;
				if (!this.isIframe) {
					this.addMetaData(result);
				} else {
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

	async pickerClick(event: Article) {
		const model = new Basket();
		if (event !== null) {
			model.basketBarcode = event.barcodes.find(p => p.tags.length === 0).barcode;
			AppComponent.current.setItem('barcode', model.basketBarcode);
		} else {
			model.basketBarcode = AppComponent.current.getItem('barcode');
		}

		let qt = await this.importService.getQuantity(model.basketBarcode).toPromise();
		if (qt.stock - qt.booked <= 0) {
			this.translate.get('Article not available!').subscribe((text: string) => {
				this.snackBar.open(text, " X ", {
					duration: 5000
				});
			});
			return;
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
									if (this.isIframe) {
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
				} else {
					window.parent.postMessage('token:' + AppComponent.current.getItem('token'), '*');
				}
			},
			onerror => {
				this.translate.get('You must login before adding to basket')
					.subscribe((message: string) => {
						this.translate.get('Login')
							.subscribe((login: string) => {
									this.snackBar.open(onerror.status === 401 ? message : onerror._body, login, {
										duration: 10000
									})
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
