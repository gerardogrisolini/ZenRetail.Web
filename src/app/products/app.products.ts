import { Component, OnInit, OnDestroy, HostListener, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { ProductService } from './../services/product.service';
import { Product } from './../shared/models';
import { AppComponent } from 'app/app.component';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';

@Component({
  moduleId: module.id,
  selector: 'app-products',
  templateUrl: './app.products.html',
  styleUrls: ['./app.products.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  private sub: any;
  products: Product[];
  filtered: Product[];
  filter: string;
  filtering: Boolean;
  fixedCols: number;
  fitListHeight: string;
  fitListWidth: string;
	close = 'Close';

  constructor(
    @Inject(DOCUMENT) private document: any,
    private titleService: Title,
    private metaService: Meta,
    public snackBar: MatSnackBar,
    private translate: TranslateService,
    private productService: ProductService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.translate.get(this.close).subscribe((res: string) => this.close = res);
    this.onResizeChanged(window);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onResizeChanged(event.target);
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(even) {
    const number = this.document.body.scrollTop;
    if (number < 1) {
      this.filtering = true;
    }
  }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      const name = params['name'];
      if (this.router.url.indexOf('brand') < 0) {
        this.loadProductsByCategory(name);
      } else {
        this.loadProductsByBrand(name);
      }
    });
  }

  ngOnDestroy() {
    // Clean sub to avoid memory leak
    this.sub.unsubscribe();
  }

  onResizeChanged(event: any) {
    const w = event.innerWidth;
    this.fixedCols = w < 600 ? 1 : w < 1200 ? 2 : 3;
    this.fitListWidth = (w - this.fixedCols - 1) + 'px';
    this.fitListHeight = (w / this.fixedCols * 1.2) + 'px';
  }

  loadProductsByCategory(categoryName: string) {
    AppComponent.setPage(categoryName);
    this.filtering = false;
    this.productService.getByCategoryName(categoryName)
        .subscribe(result => {
          this.filtered = result;
          this.products = result;
          const translations = this.products[0].categories.find(p => p.category.seo.permalink === categoryName).category.translations;
          let name = new MyTranslatePipe().transform(translations, categoryName);
          AppComponent.setPage(name);
        }, onerror => this.snackBar.open(onerror.status === 401 ? '401 - Unauthorized' : onerror._body, this.close));
  }

  loadProductsByBrand(brandName: string) {
    AppComponent.setPage(brandName);
    this.filtering = false;
    this.productService.getByBrandName(brandName)
        .subscribe(result => {
          this.filtered = result;
          this.products = result;
          let name = new MyTranslatePipe().transform(this.products[0].brand.translations, brandName);
          AppComponent.setPage(name);
        }, onerror => this.snackBar.open(onerror.status === 401 ? '401 - Unauthorized' : onerror._body, this.close));
  }

  onFilterChange(filter: string) {
    if (filter === '') {
      this.filtered = [];
      this.filtered = this.products;
      return;
    }
    this.filtered = this.products.filter(p => p.productName.indexOf(filter) >= 0);
  }

  toggleSearch() {
    this.filtering = !this.filtering;
  }
}
