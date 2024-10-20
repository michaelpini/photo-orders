import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {ToastService} from "../../shared/toasts/toast.service";

@Component({
    selector: 'change-pw',
    standalone: true,
    imports: [FormsModule, FaIconComponent, NgClass, PasswordFormFieldComponent],
    templateUrl: './change-pw.component.html',
})
export class ChangePwComponent{
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: false}) authForm!: NgForm;

    constructor(
        public modal: NgbActiveModal,
        private authService: AuthService,
        private toastService: ToastService,
    ) { }

    async submit(form: NgForm) {
        const {oldPassword, newPassword} = form.value;
        await this.changePassword(oldPassword, newPassword);
    }

    async changePassword(oldPassword: string, newPassword: string) {
        try {
            this.store.setBusy();
            await this.authService.changePassword(oldPassword, newPassword);
            this.toastService.showSuccess('Logged in successfully!');
            this.store.setIdle();
            this.modal.close('saved new user');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

}
