import {AfterViewInit, Component, computed, inject, input, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Location} from "@angular/common";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {SpinnerComponent} from "../shared/spinner/spinner.component";
import {PhotoStore} from "../store/photoStore";
import {UserCredential} from "firebase/auth";

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [FormsModule, SpinnerComponent],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',

})
export class AuthComponent implements AfterViewInit{
    @ViewChild('form', {static: false}) signUpForm!: NgForm;
    readonly store = inject(PhotoStore);
    isPasswordHidden = signal(true);
    isSignUp = input(false);
    viewEl = computed(() => ({
        title: this.isSignUp() ? 'Neuer User erstellen' : 'Bitte einloggen',
        btnOk: this.isSignUp() ? 'Erstellen' : 'Login',
    }));

    constructor(private authService: AuthService, private location: Location) {}

    ngAfterViewInit(): void {
        const email = localStorage.getItem("lastUser") || '';
        const rememberMe = Boolean(email);
        setTimeout(() => {
            this.signUpForm.form.patchValue({email, rememberMe});
            // @ts-ignore  // signUpForm will be initialized when inside timeout
            this.signUpForm.valueChanges.subscribe(selectedValue => {
                this.store.setAuthError('');
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

    authenticate(auth$: Observable<UserCredential>): void {
        auth$.subscribe(() => this.location.back())
    }

    resetPassword(email: string): void {
        this.store.setBusy(true);
        this.authService.sendResetEmail(email)

        setTimeout(() => this.store.setBusy(false), 3000);
        // Todo: send password reset request

    }
}
