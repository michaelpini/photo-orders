import {Component} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {Router} from "@angular/router";
import {ModalService} from "../modals/modal.service";

@Component({
  selector: 'app-account',
  standalone: true,
    imports: [],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
    constructor(
        private authService: AuthService,
        private modalService: ModalService,
        private router: Router
    ) {  }

    async changePassword() {
        await this.modalService.changePassword();
    }
    changeEmail() {
        throw new Error('Method not implemented.');
    }
    async logout() {
        await this.authService.signOut();
        await this.router.navigate(['home']);
    }

}
