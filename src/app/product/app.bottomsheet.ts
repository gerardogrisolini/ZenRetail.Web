import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Category } from 'app/shared/models';

@Component({
    moduleId: 'bottomsheet',
    selector: 'app.bottomsheet',
    templateUrl: './app.bottomsheet.html',
})
export class BottomSheetComponent {
    filter: string;
    categoryId: number;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: Category[],
        private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>
    ) {
        this.filter = '';
        this.categoryId = 0;
    }

    openLink(categoryId: number): void {
        this.categoryId = categoryId;
        this.bottomSheetRef.dismiss();
        event.preventDefault();
    }
}