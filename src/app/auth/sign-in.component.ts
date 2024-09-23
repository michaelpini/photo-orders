import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthResponse, AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {Location} from "@angular/common";

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements AfterViewInit{
    isPasswordHidden = true;
    error = '';
    @ViewChild('form', {static: false}) signUpForm!: NgForm;
    private isBusy = false;

    constructor(private authService: AuthService, private location: Location) {}

    ngAfterViewInit(): void {
        const email = localStorage.getItem("lastUser") || '';
        const rememberMe = Boolean(email);
        setTimeout(() => {
            this.signUpForm.form.patchValue({email, rememberMe});
            // @ts-ignore
            this.signUpForm.valueChanges.subscribe(selectedValue => {
                this.error = '';
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
        this.isBusy = true;
        auth$.subscribe({
            next: (res: AuthResponse) => {
                console.log(res);
                // this.router.navigate(['/recipes']);
                this.location.back();
                this.isBusy = false;
                this.error = '';
            },
            error: errMsg => {
                this.isBusy = false;
                this.error = errMsg;
            }
        })
    }


    resetPassword() {
        // send password reset request
    }
}
