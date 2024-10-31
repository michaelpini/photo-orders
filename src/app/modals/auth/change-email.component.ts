import {Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {ToastService} from "../../shared/toasts/toast.service";
import {firebaseAuth} from "../../../main";
import {delay} from "../../shared/util";
import {User} from "../../customers/user.model";


@Component({
    selector: 'change-email',
    standalone: true,
    imports: [FormsModule, NgClass, PasswordFormFieldComponent],
    templateUrl: './change-email.component.html',
})
export class ChangeEmailComponent implements OnInit {
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: true}) form!: NgForm;
    private activeUser = this.store.activeUser();

    constructor(
        public modal: NgbActiveModal,
        private authService: AuthService,
        private toastService: ToastService,
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            this.form?.setValue({
                newEmail: this.activeUser?.email || '',
                password: '',
                update2ndEmail: true
            })
        })
    }

    async submit(form: NgForm) {
        const {newEmail, password, update2ndEmail} = form.value;
        try {
            this.store.setBusy();
            await this.authService.signInEmail(firebaseAuth.currentUser?.email || '', password);
            await delay(2000);
            await this.authService.changeEmail(newEmail, password);
            if (update2ndEmail) {
                const data: User = {
                    id: this.activeUser?.id || '',
                    email: newEmail,
                }
                await this.store.updateUser(data);
            }
            this.toastService.showSuccess('Email changed successfully.');
            this.store.setIdle();
            this.modal.close('changed email');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }



}
