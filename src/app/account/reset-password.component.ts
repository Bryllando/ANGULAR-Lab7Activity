import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ templateUrl: 'reset-password.component.html', standalone: false })
export class ResetPasswordComponent implements OnInit {
    status = 'validating';
    token?: string;
    form!: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        const queryParams = this.route.snapshot.queryParams;
        let token = queryParams['token'] || queryParams['Token'];

        if (!token) {
            console.log('No token found in query params');
            this.status = 'invalid';
            return;
        }

        // replace spaces with pluses in case the token was corrupted by the browser/email client
        token = token.replace(/ /g, '+');
        console.log('Validating token...');

        this.accountService.validateResetToken(token)
            .pipe(
                timeout(10000),
                first(),
                catchError(error => {
                    console.error('Token validation failed error:', error);
                    this.status = 'invalid';
                    this.cd.detectChanges();
                    return of(null);
                })
            )
            .subscribe(result => {
                if (result !== null) {
                    console.log('Token is valid');
                    this.token = token;
                    this.status = 'valid';
                    // remove token from url to prevent http referer leakage
                    this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
                }
                this.cd.detectChanges();
            });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.resetPassword(this.token!, this.f.password.value, this.f.confirmPassword.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Password reset successful, you can now login', { keepAfterRouteChange: true });
                    this.router.navigate(['../login'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.cd.detectChanges();
                }
            });
    }
}