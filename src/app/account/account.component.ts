import {Component} from '@angular/core';
import {Location} from "@angular/common";
import {fbAuth} from "../app.component";
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

    logout() {
        this.authService.signOut().subscribe(() => this.location.back())
    }

}
