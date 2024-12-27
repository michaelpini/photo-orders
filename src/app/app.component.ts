import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavComponent} from './components/nav/nav.component';
import {SpinnerComponent} from "./shared/spinner/spinner.component";
import {PhotoOrdersStore} from "./store/photoOrdersStore";

import {AuthService} from "./auth/auth.service";
import {NgbdToastGlobal} from "./shared/toasts/toast-global.component";


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavComponent, SpinnerComponent, NgbdToastGlobal],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent {
    store = inject(PhotoOrdersStore)
    constructor(private authService: AuthService, /* Initialize for auto login */) { }
}
