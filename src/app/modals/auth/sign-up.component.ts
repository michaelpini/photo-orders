import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {AuthService} from "../../auth/auth.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {PasswordFormFieldComponent} from "../../custom-form-fields/password-formfield.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import {User} from "../../customers/user.model";
import {FirebaseService} from "../../persistance/firebase.service";
import {Router} from "@angular/router";

@Component({
    selector: 'sign-up',
    standalone: true,
    imports: [FormsModule, FaIconComponent, NgClass, PasswordFormFieldComponent],
    templateUrl: './sign-up.component.html',
})
export class SignUpComponent{
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: false}) authForm!: NgForm;

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
            const newUser: User = await this.authService.signUpEmail(email, password)
            const savedUser: User = await this.firebaseService.setUser(newUser);
            this.store.setUser(savedUser);
            this.store.setIdle();
            await this.router.navigate(['/customers/' + savedUser.id]);
            this.modal.close('saved new user');
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

}
