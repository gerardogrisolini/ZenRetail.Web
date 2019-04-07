import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { Category } from 'app/shared/models';

@Component({
  selector: 'app.bottomsheet',
  templateUrl: './app.bottomsheet.html',
})
export class BottomSheetComponent {
    filter: string;
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: Category[],
        private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>
    ) {}

    openLink(categoryId: Number): void {
        console.log(categoryId);
        this.bottomSheetRef.dismiss();
        event.preventDefault();
    }

    onFilterChange(filter: string) {
        // if (filter === '') {
        //   this.filtered = [];
        //   this.filtered = this.products;
        //   return;
        // }
        // this.filtered = this.products.filter(p => p.productName.indexOf(filter) >= 0);
    }
}