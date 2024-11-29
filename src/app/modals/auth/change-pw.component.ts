import {Component, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {ToastService} from "../../shared/toasts/toast.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'change-pw',
    imports: [FormsModule, NgClass, PasswordFormFieldComponent],
    templateUrl: './change-pw.component.html',
    styles: `
        .form-divider {
            margin: 1em -1em;
            border-top: 1px solid var(--bs-modal-header-border-color);
        }
        .pw-error {
            margin: 0 0 1em 0.4em;
        }
        .pw-error-x {
            color: var(--bs-red);
            font-weight: bold;
            margin-right: 0.3em
        }
    `
})
export class ChangePwComponent implements OnInit, OnDestroy{
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: true}) authForm!: NgForm;
    valueChangesSubscription: Subscription | undefined;
    passwordMismatch = signal(false);

    constructor(
        public modal: NgbActiveModal,
        private authService: AuthService,
        private toastService: ToastService,
    ) { }

    async submit(form: NgForm) {
        const {oldPassword, newPassword, repeatPassword} = form.value;
        await this.changePassword(oldPassword, newPassword);
    }

    async changePassword(oldPassword: string, newPassword: string) {
        try {
            this.store.setBusy();
            await this.authService.changePassword(oldPassword, newPassword);
            this.toastService.showSuccess('Password changed successfully.');
            this.store.setIdle();
            this.modal.close('Changed password');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.valueChangesSubscription = this.authForm.valueChanges?.subscribe(() => {
                const {newPassword, repeatPassword} = this.authForm.value;
                const error = (newPassword === repeatPassword) ? null : {error: 'passwords do not match'};
                this.authForm.controls['repeatPassword'].setErrors(error);
                this.passwordMismatch.set(!!error);
            })
        })
    }

    ngOnDestroy(): void {
        this.valueChangesSubscription?.unsubscribe();
    }


}
