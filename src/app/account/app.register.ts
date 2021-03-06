import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { Login } from 'app/shared/models';
import { AppComponent } from 'app/app.component';
import { PasswordValidation } from 'app/shared/password.validation';
import { isPlatformBrowser } from '@angular/common';

@Component({
	selector: 'app-register',
	templateUrl: 'app.register.html'
})

export class RegisterComponent implements OnInit {

	dataform: FormGroup;
	public user = new Login('', '');
	close = 'Close';
	height = 0;

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private translate: TranslateService,
		public snackBar: MatSnackBar,
		private sessionService: SessionService,
		private fb: FormBuilder) {
		AppComponent.current.setPage('Registration');
		this.translate.get(this.close).subscribe((res: string) => this.close = res);
		if (isPlatformBrowser(this.platformId)) {
			window.parent.postMessage('iframe:400', '*');
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
			'password': new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
			'confirmPassword': new FormControl('', Validators.required)
			}, {
				validator: PasswordValidation.MatchPassword
			});
	}

	register() {
		this.translate.get(this.close).subscribe((res: string) => this.close = res);
		this.sessionService.register(this.user)
			.subscribe(result => {
				this.sessionService.grantCredentials(this.user.username, result);
			},
			onerror => this.snackBar.open(onerror, this.close));
	}
}
