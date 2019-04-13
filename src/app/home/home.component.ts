import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { Product, Brand, Setting } from 'app/shared/models';
import { ProductService } from 'app/services/product.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { Helpers } from 'app/shared/helpers';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    fixedCols: number;
    fitListHeight: string;
    fitListWidth: string;
    description: string;
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
        if (isPlatformServer(this.platformId)) {
            this.resize(1200);
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.onResizeChanged(event.target);
    }
    
    get data(): Setting { return AppComponent.current.setting; }

    async onInit() {
        while (this.data == null) {
          await Helpers.delay(10);
        }
        let pipe = new MyTranslatePipe(this.platformId);
        let name = this.data.companyName;
        let title = pipe.transform(this.data.companyHomeSeo.title, name);
        this.description = pipe.transform(this.data.companyHomeSeo.description, name);
        AppComponent.current.setPage('Homepage', title, this.description, environment.hostApi + '/media/logo.png');
    }

    ngOnInit() {
        this.onInit();
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
        this.resize(w);
    }

    private resize(w: number) {
        this.fixedCols = w < 600 ? 1 : w < 1200 ? 2 : 3;
        this.fitListWidth = (w - this.fixedCols - 1) + 'px';
        this.fitListHeight = (w / this.fixedCols * 1.2) + 'px';
    }
}
