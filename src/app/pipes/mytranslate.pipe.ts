import { Pipe, PipeTransform } from '@angular/core';
import { Translation } from 'app/shared/models';

@Pipe({
  name: 'mytranslate'
})
export class MyTranslatePipe implements PipeTransform {
  constructor() { }
  
  transform(value: Translation[], args0?: string): string {
    let country = 'en';
    if (navigator) {
      country = navigator.language.substring(0, 2).toUpperCase();
    }
    const translate = value.find(p => p.country === country);
    return translate != null ? translate.value : args0;
  }
}
