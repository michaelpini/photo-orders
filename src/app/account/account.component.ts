import {Component, inject} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {Router} from "@angular/router";
import {ModalService} from "../modals/modal.service";
import {CustomerDetailComponent} from "../customers/customer-detail/customer-detail.component";
import {firebaseAuth} from "../../main";
import {PhotoOrdersStore} from "../store/photoOrdersStore";

@Component({
    selector: 'app-account',
    standalone: true,
    templateUrl: './account.component.html',
    imports: [CustomerDetailComponent],
    styles: `.w-max-lg {max-width: 768px;}`
})
export class AccountComponent {
    protected store = inject(PhotoOrdersStore);

    constructor(
        private authService: AuthService,
        private modalService: ModalService,
        private router: Router
    ) {  }

    async verifyEmail() {
        await this.modalService.confirmSendEmailVerification(firebaseAuth.currentUser!.email!);
        await this.authService.sendEmailVerificationLink();
    }

    async changePassword() {
        await this.modalService.changePassword();
    }

    async changeEmail() {
        await this.modalService.changeEmail();
    }

    async logout() {
        await this.authService.signOut();
        await this.router.navigate(['home']);
    }

}
