import {AfterViewInit, Component, computed, inject, input, model, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Location} from "@angular/common";
import {AuthService} from "./auth.service";
import {SpinnerComponent} from "../shared/spinner/spinner.component";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {ActivatedRoute} from "@angular/router";
import {FirebaseService} from "../persistance/firebase.service";
import {User} from "../customers/user.model";

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
    readonly store = inject(PhotoOrdersStore);
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

    async signIn(email: string, password: string) {
        try {
            this.store.setBusy(true);
            await this.authService.signInEmail(email, password);
            this.store.setBusy(false);
            this.store.setAuthError();
            this.location.back();
        } catch (err: any) {
            this.store.setAuthError(err);
            this.store.setBusy(false);
        }
    }

    async signUp(email: string, password: string) {
        try {
            this.store.setBusy(true);
            const newUser: User = await this.authService.signUpEmail(email, password)
            const savedUser: User = await this.firebaseService.setUser(newUser);
            this.store.setUser(savedUser);
            this.store.setBusy(false);
            this.store.setAuthError();
            this.location.back();
        } catch (err) {
            this.store.setAuthError(err as string);
            this.store.setBusy(false);
        }
    }

    async resetPassword(email: string): Promise<void> {
        try {
            this.store.setBusy(true);
            await this.authService.sendResetEmail(email);
            this.store.setBusy(false)
            this.store.setAuthError();
            alert(`Email sent to ${email}`);
        } catch (err: any) {
            this.store.setAuthError(err);
            this.store.setBusy(false)
        }
    }

    back(): void {
        this.location.back();
    }

}
