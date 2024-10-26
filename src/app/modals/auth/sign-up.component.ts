import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {User} from "../../customers/user.model";
import {FirebaseService} from "../../persistance/firebase.service";
import {Router} from "@angular/router";
import {User as AuthUser} from "firebase/auth"

@Component({
    selector: 'sign-up',
    standalone: true,
    imports: [FormsModule, NgClass, PasswordFormFieldComponent],
    templateUrl: './sign-up.component.html',
})
export class SignUpComponent{
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: false}) authForm!: NgForm;
    id: string = '';    // Will be set by router: /signup/:id

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
            const authUser: AuthUser = await this.authService.signUpEmail(email, password);
            const userPartial: User = {
                id: this.id,
                uid: authUser.uid,
                userName: authUser.email,
            }
            const updatedUser: User = await this.firebaseService.updateUser(userPartial);
            this.store.setUser(updatedUser);
            this.store.setIdle();
            await this.router.navigate(['/account/']);
            this.modal.close('saved new user');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

}
