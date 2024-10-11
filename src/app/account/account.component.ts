import {Component} from '@angular/core';
import {Location} from "@angular/common";
import {AuthService} from "../auth/auth.service";

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
        private location: Location)
    {  }

    async logout() {
        await this.authService.signOut();
        this.location.back();
    }

}
