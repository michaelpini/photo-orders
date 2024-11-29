import {AfterViewInit, Component, inject, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ToastService} from "../../shared/toasts/toast.service";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";

@Component({
    selector: 'sign-in',
    imports: [FormsModule, NgClass, PasswordFormFieldComponent],
    templateUrl: './sign-in.component.html'
})
export class SignInComponent implements AfterViewInit{
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: false}) authForm!: NgForm;

    constructor(
        public modal: NgbActiveModal,
        private authService: AuthService,
        private toastService: ToastService,
    ) { }

    ngAfterViewInit(): void {
        const email = localStorage.getItem("lastUser") || '';
        const rememberMe = Boolean(email);
        setTimeout(() => {  // Timeout required to have form initialized
            this.authForm.form.patchValue({email, rememberMe});
        }, 0);
    }

    async submit(form: NgForm) {
        const {email, password} = form.value;
        await this.signIn(email, password);
        if (form.value.rememberMe) {
            localStorage.setItem('lastUser', form.value.email);
        } else {
            localStorage.removeItem('lastUser');
        }
    }

    async signIn(email: string, password: string) {
        try {
            this.store.setBusy();
            await this.authService.signInEmail(email, password);
            this.store.setIdle();
            this.toastService.showSuccess('Logged in successfully!');
            this.modal.close('signed in');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

    async resetPassword(): Promise<void> {
        const email = this.authForm.value.email;
        if (!email || !/^[^@]+@[^@]+$/.test(email)) {
            this.toastService.showError('Bitte zuerst eine gültige Email Adresse eingeben');
            return;
        }
        try {
            this.store.setBusy();
            await this.authService.sendResetEmail(email);
            this.store.setIdle();
            this.toastService.showSuccess(`Email wurde an folgende Adresse gesendet: \n${email}`);
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

}
