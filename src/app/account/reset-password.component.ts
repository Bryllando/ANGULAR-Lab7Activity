import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

enum TokenStatus {
    Validating,
    Valid,
    Invalid
}

@Component({ templateUrl: 'reset-password.component.html', standalone: false })
export class ResetPasswordComponent implements OnInit {
    TokenStatus = TokenStatus;
    tokenStatus = TokenStatus.Validating;
    token?: string;
    form!: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
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
            this.tokenStatus = TokenStatus.Invalid;
            return;
        }

        // replace spaces with pluses in case the token was corrupted by the browser/email client
        token = token.replace(/ /g, '+');

        this.accountService.validateResetToken(token)
            .pipe(
                timeout(10000),
                first(),
                catchError(error => {
                    console.error('Token validation failed:', error);
                    this.tokenStatus = TokenStatus.Invalid;
                    return of(null);
                })
            )
            .subscribe(result => {
                if (result !== null) {
                    this.token = token;
                    this.tokenStatus = TokenStatus.Valid;
                    // remove token from url to prevent http referer leakage
                    this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
                }
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
                }
            });
    }
}