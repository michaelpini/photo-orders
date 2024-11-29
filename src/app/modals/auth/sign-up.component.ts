import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {FirebaseService} from "../../persistance/firebase.service";
import {Router} from "@angular/router";
import {User as FirebaseAuthUser} from "firebase/auth"
import {AuthUser} from "../../auth/authUser.model";

@Component({
    selector: 'sign-up',
    imports: [FormsModule, NgClass, PasswordFormFieldComponent],
    templateUrl: './sign-up.component.html'
})
export class SignUpComponent{
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: false}) authForm!: NgForm;
    userId: string = '';

    constructor(
        public modal: NgbActiveModal,
        private authService: AuthService,
        private firebaseService: FirebaseService,
        private router: Router,
    ) { }

    async submit(form: NgForm) {
        const {email, password} = form.value;
        await this.signUp(email, password);
    }

    async signUp(email: string, password: string) {
        try {
            this.store.setBusy();
            this.store.setAuthInitializingNewUser(true);
            const authUser: FirebaseAuthUser = await this.authService.signUpEmail(email, password);
            const authUserPartial: AuthUser = {
                id: authUser.uid,
                userId: this.userId,
                userName: email,
            }
            const updatedAuthUser: AuthUser = await this.firebaseService.setAuthUser(authUserPartial);
            this.store.setAuthInitializingNewUser(false);
            this.store.setAuthUserAndActiveUser(updatedAuthUser.id);
            this.store.setIdle();
            await this.router.navigate(['/account/']);
            this.modal.close('saved new user');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

}
