import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from 'app/services/product.service';
import { BasketService } from 'app/services/basket.service';
import { Product, Article, Basket } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';

@Component({
	moduleId: module.id,
	selector: 'app-product',
	templateUrl: 'app.product.html',
	styleUrls: ['app.product.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
	private sub: any;
	product: Product;
	
	constructor(
		private titleService: Title,
		private metaService: Meta,
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
	  
	get isIframe(): boolean { return AppComponent.inIframe(); }

	ngOnInit() {
		if (localStorage.getItem('barcode')) {
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
    let title = new MyTranslatePipe().transform(product.translations, product.productName);
    this.titleService.setTitle(title);
    let description = new MyTranslatePipe().transform(product.seo.description, product.productName);
    //this.metaService.removeTag('name="description"');
    this.metaService.addTag({ name: 'description', content: description }, false);
	AppComponent.setPage(product.productName, !this.isIframe, !this.isIframe);
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

	pickerClick(event: Article) {
		const model = new Basket();
		if (event !== null) {
			model.basketBarcode = event.barcodes.find(p => p.tags.length === 0).barcode;
			localStorage.setItem('barcode', model.basketBarcode);
		} else {
			model.basketBarcode = localStorage.getItem('barcode');
		}
		this.basketService
			.create(model)
			.subscribe(result => {
				localStorage.removeItem('barcode');
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
					window.parent.postMessage('token:' + localStorage.getItem('token'), '*');
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
										localStorage.setItem('origin', this.router.url);
										this.router.navigate(['login']);
									});
							});
					});
			});
	}
}
