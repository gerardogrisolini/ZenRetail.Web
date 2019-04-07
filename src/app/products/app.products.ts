import { Component, OnInit, OnDestroy, HostListener, Inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { ProductService } from './../services/product.service';
import { Product, Category, Brand } from './../shared/models';
import { AppComponent } from 'app/app.component';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { BottomSheetComponent } from './app.bottomsheet';

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
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) {
    this.translate.get(this.close).subscribe((res: string) => this.close = res);
    this.onResizeChanged(window);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onResizeChanged(event.target);
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

  openBottomSheet(): void {
    let input = this.products.map(p => p.categories.map(s => s.category).filter(f => !f.categoryIsPrimary));
    let categories = input.reduce(function(a, b) {
      return a.concat(b);
    }, []);
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent, {
      data: categories,
    });
    bottomSheetRef.afterDismissed().subscribe(() => {
      console.log('Bottom sheet has been dismissed: ' + bottomSheetRef.instance.filter);
    });
  }

  addMetaByCategory(category: Category) {
    let title = new MyTranslatePipe().transform(category.translations, category.categoryName);
    this.titleService.setTitle(title);
    let description = new MyTranslatePipe().transform(category.seo.description, category.categoryName);
    this.metaService.addTag({ name: 'description', content: description }, false);
    AppComponent.setPage(title);
  }

  addMetaByBrand(brand: Brand) {
    let title = new MyTranslatePipe().transform(brand.translations, brand.brandName);
    this.titleService.setTitle(title);
    let description = new MyTranslatePipe().transform(brand.seo.description, brand.brandName);
    this.metaService.addTag({ name: 'description', content: description }, false);
    AppComponent.setPage(title);
  }
  
  loadProductsByCategory(categoryName: string) {
    AppComponent.setPage(categoryName);
    this.productService.getByCategoryName(categoryName)
        .subscribe(result => {
          this.filtered = result;
          this.products = result;
          const category = this.products[0].categories.find(p => p.category.seo.permalink === categoryName).category;
          this.addMetaByCategory(category);
        }, onerror => this.snackBar.open(onerror._body, this.close));
  }

  loadProductsByBrand(brandName: string) {
    AppComponent.setPage(brandName);
    this.productService.getByBrandName(brandName)
        .subscribe(result => {
          this.filtered = result;
          this.products = result;
          this.addMetaByBrand(this.products[0].brand);
        }, onerror => this.snackBar.open(onerror._body, this.close));
  }

  onFilterChange(filter: string) {
    if (filter === '') {
      this.filtered = [];
      this.filtered = this.products;
      return;
    }
    this.filtered = this.products.filter(p => p.productName.indexOf(filter) >= 0);
  }
}
