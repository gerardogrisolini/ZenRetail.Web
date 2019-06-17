import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { SessionService } from 'app/services/session.service';
import { BasketService } from 'app/services/basket.service';
import { Login } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
	selector: 'app-login',
	templateUrl: 'app.login.html'
})

export class LoginComponent implements OnInit {
	dataform: FormGroup;
	public user = new Login('', '');
	height = 0;

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private translate: TranslateService,
		public snackBar: MatSnackBar,
		private sessionService: SessionService,
		private basketService: BasketService,
		private fb: FormBuilder
	) {
		AppComponent.current.setPage('Authentication');
		if (isPlatformBrowser(this.platformId)) {
			window.parent.postMessage('iframe:300', '*');
		}
		this.height = window.innerHeight - 100;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.height = event.target.innerHeight - 100;
	}

	ngOnInit() {
		this.dataform = this.fb.group({
			'email': new FormControl('', [Validators.required, Validators.email]),
			'password': new FormControl('', Validators.required)
		});
	}

	login() {
		this.sessionService.login(this.user)
			.subscribe(result => {
				this.sessionService.grantCredentials(this.user.username, result);
				this.loadBasket();
			}, onerror => {
				this.translate.get('Invalid email and/or password!')
					.subscribe((res: string) => this.snackBar.open(res, " X ", {
						duration: 5000
					}));
			});
	}

	loadBasket() {
		this.basketService.get()
			.subscribe(result => {
				this.basketService.basket = result;
			});
	}
}
