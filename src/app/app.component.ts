import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import * as deCH from '@angular/common/locales/de-CH';
import {HeaderComponent} from './header/header.component';
import {AuthService} from "./auth/auth.service";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FontAwesomeModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService) {
        registerLocaleData(deCH.default);
    }

    ngOnInit(): void {
        this.authService.autoSignIn();
    }
}
