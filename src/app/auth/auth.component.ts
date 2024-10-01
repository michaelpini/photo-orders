import {AfterViewInit, Component, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Location} from "@angular/common";
import {Observable} from "rxjs";
import {AuthResponse, AuthService} from "./auth.service";
import {SpinnerComponent} from "../shared/spinner/spinner.component";

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [FormsModule, SpinnerComponent],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',

})
export class AuthComponent implements AfterViewInit{
    @ViewChild('form', {static: false}) signUpForm!: NgForm;
    isPasswordHidden = signal(true);
    error = signal('');
    isBusy = signal(false);

    constructor(private authService: AuthService, private location: Location) {}

    ngAfterViewInit(): void {
        const email = localStorage.getItem("lastUser") || '';
        const rememberMe = Boolean(email);
        setTimeout(() => {
            this.signUpForm.form.patchValue({email, rememberMe});
            // @ts-ignore  // signUpForm will be initialized when inside timeout
            this.signUpForm.valueChanges.subscribe(selectedValue => {
                this.error.set('');
            })
        }, 0);

    }

    submit(form: NgForm) {
        if (form.value.rememberMe) {
            localStorage.setItem('lastUser', form.value.email);
        } else {
            localStorage.removeItem('lastUser');
        }
        const {email, password} = form.value;
        this.authenticate(this.authService.signInEmail(email, password));
    }

    authenticate(auth$: Observable<AuthResponse>): void {
        this.isBusy.set(true);
        auth$.subscribe({
            next: (res: AuthResponse) => {
                console.log(res);
                // this.router.navigate(['/recipes']);
                this.location.back();
                this.isBusy.set(false);
                this.error.set('');
            },
            error: errMsg => {
                this.isBusy.set(false);
                this.error.set(errMsg);
            }
        })
    }

    resetPassword() {
        this.isBusy.set(true);
        setTimeout(() => this.isBusy.set(false), 3000);
        // send password reset request
    }
}
