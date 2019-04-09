import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { ProductService } from 'app/services/product.service';
import { Product, Category, Brand } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { BottomSheetComponent } from './app.bottomsheet';
import { ParseUrlPipe } from 'app/pipes/parseurl.pipe';
import { isPlatformBrowser } from '@angular/common';

@Component({
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
    @Inject(PLATFORM_ID) private platformId: Object,
    public snackBar: MatSnackBar,
    private translate: TranslateService,
    private productService: ProductService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) {
    this.translate.get(this.close).subscribe((res: string) => this.close = res);
    if (isPlatformBrowser(this.platformId)) {
      this.onResizeChanged(window);
    }
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
      this.onFilterChange(bottomSheetRef.instance.filter);
      this.onCategoryChange(bottomSheetRef.instance.categoryId);
    });
  }

  addMetaByCategory(category: Category) {
    let pipe = new MyTranslatePipe(this.platformId);
    let name = pipe.transform(category.translations, category.categoryName);
    let title = pipe.transform(category.seo.title, name);
    let description = pipe.transform(category.seo.description, name);
    let image = new ParseUrlPipe().transform([category.media], 'thumb')
    AppComponent.current.setPage(name, title, description, image);
  }

  addMetaByBrand(brand: Brand) {
    let pipe = new MyTranslatePipe(this.platformId);
    let name = pipe.transform(brand.translations, brand.brandName);
    let title = pipe.transform(brand.seo.title, name);
    let description = pipe.transform(brand.seo.description, name);
    let image = new ParseUrlPipe().transform([brand.media], 'thumb')
    AppComponent.current.setPage(name, title, description, image);
  }
  
  loadProductsByCategory(categoryName: string) {
    this.productService.getByCategoryName(categoryName)
        .subscribe(result => {
          this.filtered = result;
          this.products = result;
          const category = this.products[0].categories.find(p => p.category.seo.permalink === categoryName).category;
          this.addMetaByCategory(category);
        }, onerror => this.snackBar.open(onerror._body, this.close));
  }

  loadProductsByBrand(brandName: string) {
    this.productService.getByBrandName(brandName)
        .subscribe(result => {
          this.filtered = result;
          this.products = result;
          let brand = this.products[0].brand;
          this.addMetaByBrand(brand);
        }, onerror => this.snackBar.open(onerror._body, this.close));
  }

  onCategoryChange(categoryId: number) {
    if (categoryId === 0) {
      this.filtered = [];
      this.filtered = this.products;
      return;
    }
    this.filtered = this.products.filter(p => p.categories.filter(f => f.category.categoryId == categoryId).length > 0);
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