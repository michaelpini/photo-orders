import {AfterViewInit, Component, computed, inject, input, model, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Location} from "@angular/common";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {SpinnerComponent} from "../shared/spinner/spinner.component";
import {PhotoStore} from "../store/photoStore";
import {AuthUser} from "./authUser.model";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {ActivatedRoute} from "@angular/router";
import {FirebaseService} from "../persistance/firebase.service";
import {Customer, User} from "../customers/customer.model";

@Component({
    selector: 'auth-form',
    standalone: true,
    imports: [FormsModule, SpinnerComponent, FaIconComponent],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',

})
export class AuthComponent implements AfterViewInit{
    @ViewChild('form', {static: false}) authForm!: NgForm;
    readonly faChevronLeft = faChevronLeft;
    readonly store = inject(PhotoStore);
    isPasswordHidden = signal(true);
    isSignUp = signal(false);
    viewEl = computed(() => ({
        title: this.isSignUp() ? 'Neuer User erstellen' : 'Bitte einloggen',
        btnOk: this.isSignUp() ? 'Erstellen' : 'Login',
    }));

    constructor(
        private authService: AuthService,
        private firebaseService: FirebaseService,
        private location: Location,
        private route: ActivatedRoute,
    ) {
        const url = this.route.snapshot.url;
        this.isSignUp.set(url[url.length - 1].path.includes('signup'))
    }

    ngAfterViewInit(): void {
        const email = localStorage.getItem("lastUser") || '';
        const rememberMe = Boolean(email);
        setTimeout(() => {
            if (!this.isSignUp()) this.authForm.form.patchValue({email, rememberMe});
            // @ts-ignore  // signUpForm will be initialized when inside timeout
            this.authForm.valueChanges.subscribe(selectedValue => {
                this.store.setAuthError('');
            })
        }, 0);

    }

    submit(form: NgForm) {
        const {email, password} = form.value;
        this.store.setBusy(true);
        if (this.isSignUp()) {
            this.signUp(email, password);
        } else {
            this.signIn(email, password);
            if (form.value.rememberMe) {
                localStorage.setItem('lastUser', form.value.email);
            } else {
                localStorage.removeItem('lastUser');
            }
        }
    }

    signIn(email: string, password: string) {
        this.authService.signInEmail(email, password).subscribe(() => {
            this.store.setBusy(false);
            this.location.back();
        });
    }

    signUp(email: string, password: string) {
        this.authService.signUpEmail(email, password).subscribe((authUser: AuthUser) => {
            const newUser: User = {
                id: authUser.id,
                email: authUser.email,
                userName: authUser.email,
                firstName: 'Neu',
                auth: 'user'
            }
            this.firebaseService.setUser(newUser).then(user => {
                this.store.setUser(user);
                this.store.setBusy(false);
                this.location.back();
            });
        })
    }

    resetPassword(email: string): void {
        this.store.setBusy(true);
        this.authService.sendResetEmail(email).subscribe(() => {
            this.store.setBusy(false)
            alert(`Email sent to ${email}`);
        })
    }

    back(): void {
        this.location.back();
    }

}
