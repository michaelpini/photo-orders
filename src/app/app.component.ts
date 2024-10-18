import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
// import {registerLocaleData} from '@angular/common';
// import * as deCH from '@angular/common/locales/de-CH';
import {NavComponent} from './nav/nav.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SpinnerComponent} from "./shared/spinner/spinner.component";
import {PhotoOrdersStore} from "./store/photoOrdersStore";

import {AuthService} from "./auth/auth.service";
import {NgbdToastGlobal} from "./shared/toasts/toast-global.component";


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavComponent, FontAwesomeModule, SpinnerComponent, NgbdToastGlobal],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent {
    store = inject(PhotoOrdersStore)
    constructor(private authService: AuthService, /* Initialize for auto login */) {
        // registerLocaleData(deCH.default);
    }
}
