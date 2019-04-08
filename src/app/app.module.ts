import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MaterialModule } from 'app/material.module';
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { LayoutModule } from '@angular/cdk/layout';
import { SwiperModule } from 'angular2-useful-swiper';
import { AgmCoreModule } from '@agm/core';

import { ALL_ROUTES } from 'app/routes';

import { UrlInterceptor } from 'app/services/url.interceptor';
import { DialogService } from 'app/services/dialog.service';
import { SessionService } from 'app/services/session.service';
import { RegistryService } from 'app/services/registry.service';
import { ProductService } from 'app/services/product.service';
import { BasketService } from 'app/services/basket.service';
import { DocumentService } from 'app/services/document.service';

import { CurrencyFormatPipe } from 'app/pipes/currency-format.pipe';
import { ParseUrlPipe } from 'app/pipes/parseurl.pipe';
import { ImageUrlPipe } from 'app/pipes/imageurl.pipe';
import { MyTranslatePipe } from 'app/pipes/mytranslate.pipe';
import { ArticleInfoPipe } from 'app/pipes/articleinfo.pipe';
import { ArticlePicker } from 'app/shared/article.picker';
import { ConfirmDialog } from 'app/shared/confirm.dialog';

import { AppComponent } from 'app/app.component';
import { HomeComponent } from 'app/home/home.component';
import { InfoComponent } from 'app/home/info.component';
import { AccountComponent } from 'app/account/app.account';
import { LoginComponent } from 'app/account/app.login';
import { RegisterComponent } from 'app/account/app.register';
import { ProductsComponent } from 'app/product/app.products';
import { ProductComponent } from 'app/product/app.product';
import { BasketComponent } from 'app/basket/app.basket';
import { CheckoutComponent } from 'app/basket/app.checkout';
import { OrdersComponent } from 'app/order/app.orders';
import { DocumentComponent } from 'app/order/app.document';
import { BottomSheetComponent } from 'app/product/app.bottomsheet';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  // return new TranslateHttpLoader(http);
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    CurrencyFormatPipe,
    ParseUrlPipe,
    ImageUrlPipe,
    MyTranslatePipe,
    ArticleInfoPipe,
    ArticlePicker,
    ConfirmDialog,
    AppComponent,
    HomeComponent,
    InfoComponent,
    AccountComponent,
    LoginComponent,
    RegisterComponent,
    ProductsComponent,
    ProductComponent,
    BasketComponent,
    CheckoutComponent,
    OrdersComponent,
    DocumentComponent,
    BottomSheetComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'zenretail-web' }),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    LayoutModule,
    HttpClientModule,
    SwiperModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB3lyD6l1LxMEX0wNVhj6tmD_sDDRTjtA8'
    }),
    RouterModule.forRoot(ALL_ROUTES),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    { provide: HTTP_INTERCEPTORS, useClass: UrlInterceptor, multi: true },
    DialogService,
    SessionService,
    RegistryService,
    ProductService,
    BasketService,
    DocumentService
  ],
  exports: [
    ArticlePicker,
    ConfirmDialog,
    CurrencyFormatPipe,
    ImageUrlPipe,
    ParseUrlPipe,
    MyTranslatePipe,
    ArticleInfoPipe
  ],
  entryComponents: [
    ConfirmDialog,
    BottomSheetComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

