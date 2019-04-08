import { Pipe, PipeTransform, Inject, PLATFORM_ID } from '@angular/core';
import { Translation } from 'app/shared/models';
import { isPlatformBrowser } from '@angular/common';

@Pipe({
  name: 'mytranslate'
})
export class MyTranslatePipe implements PipeTransform {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  
  transform(value: Translation[], args0?: string): string {
    let country = 'en';
    if (isPlatformBrowser(this.platformId)) {
      country = navigator.language.substring(0, 2).toUpperCase();
    }
    const translate = value.find(p => p.country === country);
    return translate != null ? translate.value : args0;
  }
}
