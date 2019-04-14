import { Component, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatSnackBar, MatTableDataSource, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from 'app/services/session.service';
import { RegistryService } from 'app/services/registry.service';
import { Movement } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
	selector: 'app-orders',
	templateUrl: 'app.orders.html',
	styleUrls: ['app.orders.scss']
})

export class OrdersComponent implements OnInit {

	@ViewChild(MatSort) sort: MatSort;
	dataSource: MatTableDataSource<Movement>;
	displayedColumns = ['movementNumber', 'movementDate', 'movementAmount', 'movementPayment', 'movementStatus', 'doc'];

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		public snackBar: MatSnackBar,
		private translate: TranslateService,
		private sessionService: SessionService,
		private registryService: RegistryService) {
		AppComponent.current.setPage('Orders');
	}

	ngOnInit() {
		if (!this.sessionService.checkCredentials()) { return; }

		this.loadOrders();
	}
	
	loadOrders() {
		this.registryService.getOrders()
			.subscribe(result => {
				this.dataSource = new MatTableDataSource(result);
				this.dataSource.sort = this.sort;
				const height = (result.length * 50) + 255;
				if (isPlatformBrowser(this.platformId)) {
					window.parent.postMessage('iframe:' + height, '*');
				}
			},
			onerror => {
				this.translate.get('Close').subscribe((close: string) =>
					this.snackBar.open(onerror.status === 401 ? '401 - Unauthorized' : onerror._body, close)
				);
			});
	}
}