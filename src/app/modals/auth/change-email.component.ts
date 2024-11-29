import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {ToastService} from "../../shared/toasts/toast.service";
import {firebaseAuth} from "../../../main";
import {delay} from "../../shared/util";
import {User} from "../../components/customers/user.model";
import {AuthUser} from "../../auth/authUser.model";
import {FirebaseService} from "../../persistance/firebase.service";


@Component({
    selector: 'change-email',
    imports: [FormsModule, NgClass, PasswordFormFieldComponent],
    templateUrl: './change-email.component.html'
})
export class ChangeEmailComponent implements OnInit {
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: true}) form!: NgForm;
    private activeUser = this.store.activeUser();

    constructor(
        public modal: NgbActiveModal,
        private authService: AuthService,
        private toastService: ToastService,
        private firebaseService: FirebaseService,
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
        const {newEmail, password, update2ndEmail} = form.value as {[key: string] : string};
        try {
            this.store.setBusy();
            await this.authService.signInEmail(firebaseAuth.currentUser?.email || '', password);
            await delay(2000);
            await this.authService.changeEmail(newEmail, password);
            const updatedAuthUser: AuthUser = await this.firebaseService.updateAuthUser({
                userName: newEmail,
                emailVerified: false
            });
            this.store.setAuthUser(updatedAuthUser);
            if (update2ndEmail) {
                const id = this.activeUser?.id || ''
                const data: User = {id , email: newEmail}
                const updatedUser = await this.store.updateUser(data);
                this.store.setActiveUser(updatedUser);
            }
            this.toastService.showSuccess('Email changed successfully.');
            this.store.setIdle();
            this.modal.close('changed email');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }



}
