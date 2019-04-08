import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Product, Brand } from 'app/shared/models';
import { ProductService } from 'app/services/product.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    fixedCols: number;
    fitListHeight: string;
    fitListWidth: string;
    featured: Product[];
    news: Product[];
    brands: Brand[];

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private productService: ProductService
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.onResizeChanged(window);
        }
        AppComponent.current.setPage('Homepage', 'Homepage', 'Homepage');
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.onResizeChanged(event.target);
    }

    ngOnInit() {
        this.productService
            .getFeatured()
            .subscribe(result => {
                this.featured = result;
            });
        this.productService
            .getNews()
            .subscribe(result => {
                this.news = result;
            });
        this.productService
            .getBrands()
            .subscribe(result => {
                this.brands = result;
            });
    }

    onResizeChanged(event: any) {
        const w = event.innerWidth;
        this.fixedCols = w < 600 ? 1 : w < 1200 ? 2 : 3;
        this.fitListWidth = (w - this.fixedCols - 1) + 'px';
        this.fitListHeight = (w / this.fixedCols * 1.2) + 'px';
    }
}
