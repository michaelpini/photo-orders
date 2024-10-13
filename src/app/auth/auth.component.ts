import {AfterViewInit, Component, computed, inject, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {Location, NgClass} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-regular-svg-icons";
import {faChevronLeft, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import {FirebaseService} from "../persistance/firebase.service";
import {AuthService} from "./auth.service";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {User} from "../customers/user.model";

@Component({
    selector: 'auth-form',
    standalone: true,
    imports: [FormsModule, FaIconComponent, NgClass],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',
})
export class AuthComponent implements AfterViewInit{
    protected readonly faTriangleExclamation = faTriangleExclamation
    protected readonly faEye = faEye;
    protected readonly faEyeSlash = faEyeSlash;
    protected readonly faChevronLeft = faChevronLeft;
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: false}) authForm!: NgForm;
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
        private router: Router
    ) {
        const url = this.route.snapshot.url;
        this.isSignUp.set(url[url.length - 1].path.includes('signup'))
    }

    ngAfterViewInit(): void {
        const email = localStorage.getItem("lastUser") || '';
        const rememberMe = Boolean(email);
        setTimeout(() => {  // Timeout required to have form initialized
            if (!this.isSignUp()) this.authForm.form.patchValue({email, rememberMe});
            this.authForm.valueChanges?.subscribe(selectedValue => {
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
        } catch (err) {
            this.store.setAuthError((err as Error).message);
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
            await this.router.navigate(['/customers/' + savedUser.id]);
        } catch (err) {
            this.store.setAuthError((err as Error).message);
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
        } catch (err) {
            this.store.setAuthError((err as Error).message);
            this.store.setBusy(false)
        }
    }

    back(): void {
        this.location.back();
    }


    validateMinLengthNoSpace(value: string): boolean {
        return /^(?!.* ).{10,100}$/.test(value)!;
    }
    validateHasCapital(value: string): boolean {
        return /^(?=.*[A-Z])/.test(value)!;
    }
    validateHasChar(value: string): boolean {
        return /^(?=.*[a-z])/.test(value)!;
    }
    validateHasNumber(value: string): boolean {
        return /^(?=.*[0-9])/.test(value)!;
    }

}
