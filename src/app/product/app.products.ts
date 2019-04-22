import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { ProductService } from 'app/services/product.service';
import { Product, Category, Brand } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { BottomSheetComponent } from './app.bottomsheet';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { ParseUrlPipe } from 'app/pipes/parseurl.pipe';

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
  title: string;
	description: string;
	image: string;
  close = 'Close';
  isFullLoaded: Boolean;
  page = 0;
  size = 0;

  constructor(
    public snackBar: MatSnackBar,
    private translate: TranslateService,
    private productService: ProductService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) {
    this.onResizeChanged(window);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onResizeChanged(event.target);
  }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.filtered = [];
      this.page = 0;
      const name = params['name'];
      if (this.router.url.indexOf('brand') < 0) {
        this.loadProductsByCategory(name);
      } else {
        this.loadProductsByBrand(name);
      }
      this.translate.get(this.close).subscribe((res: string) => this.close = res);
    });
  }

  ngOnDestroy() {
    // Clean sub to avoid memory leak
    this.sub.unsubscribe();
  }

  onResizeChanged(event: any) {
    const w = event.innerWidth;
    this.resize(w);
  }

  private resize(w: number) {
      this.fixedCols = w < 600 ? 1 : w < 1200 ? 2 : 3;
      this.size = this.fixedCols == 3 ? 12 : 8;
      this.fitListWidth = (w - this.fixedCols - 1) + 'px';
      this.fitListHeight = (w / this.fixedCols * 1.2) + 'px';
  }

  openBottomSheet(): void {
    let input = this.products.map(p => p.categories.map(s => s.category).filter(f => !f.categoryIsPrimary));
    let categories: Category[] = [];
    for (var data of input) {
      if (categories.findIndex(p => p.categoryId == data[0].categoryId) < 0) {
        categories.push(data[0]);
      }
    }
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent, {
      data: categories,
    });
    bottomSheetRef.afterDismissed().subscribe(() => {
      this.onFilterChange(bottomSheetRef.instance.filter);
      this.onCategoryChange(bottomSheetRef.instance.categoryId);
    });
  }

  addMetaByCategory(category: Category) {
    let pipe = new MyTranslatePipe();
    let name = pipe.transform(category.translations, category.categoryName);
    this.title = pipe.transform(category.seo.title, name);
    this.description = pipe.transform(category.seo.description, name);
    this.image = new ParseUrlPipe().transform([category.media], 'thumb')
    AppComponent.current.setPage('Category');
  }

  addMetaByBrand(brand: Brand) {
    let pipe = new MyTranslatePipe();
    let name = pipe.transform(brand.translations, brand.brandName);
    this.title = pipe.transform(brand.seo.title, name);
    this.description = pipe.transform(brand.seo.description, name);
    this.image = new ParseUrlPipe().transform([brand.media], 'thumb')
    AppComponent.current.setPage('Brand');
  }
  
  loadProductsByCategory(categoryName: string) {
    this.productService.getByCategoryName(categoryName)
        .subscribe(result => {
          this.products = result;
          this.getData();
          const category = this.products[0].categories.find(p => p.category.seo.permalink === categoryName).category;
          this.addMetaByCategory(category);
        }, onerror => this.snackBar.open(onerror._body, this.close));
  }

  loadProductsByBrand(brandName: string) {
    this.productService.getByBrandName(brandName)
        .subscribe(result => {
          this.products = result;
          this.getData();
          let brand = this.products[0].brand;
          this.addMetaByBrand(brand);
        }, onerror => this.snackBar.open(onerror._body, this.close));
  }

  getData() {
    let startingIndex = this.page * this.size;
    var endingIndex = startingIndex + this.size;
    if (this.products.length <= endingIndex) {
      this.isFullLoaded = true;
      endingIndex = this.products.length;
    }
    for (var i = startingIndex; i < endingIndex; i++) {
      this.filtered.push(this.products[i]);
    }
    this.page++;
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
