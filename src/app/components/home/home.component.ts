import { Component } from '@angular/core';
import {Toast, ToastService} from "../../shared/toasts/toast.service";

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    constructor(private toastService: ToastService) {
    }
    onShowSuccess() {
        const toast: Toast = {
            message: 'This is a very long toast message, \nwhich would look best if it was wrapped. Lets hope it does it this time.',
            icon: 'success',
            classname: 'bg-success text-light',
        }
        this.toastService.show(toast);
    }

    onShowDanger() {
        const toast: Toast = {
            message: 'This is another very long toast message, \nDanger! Lets get out of here.',
            icon: 'error',
            classname: 'bg-danger text-light',
            autohide: false
        }
        this.toastService.show(toast);
    }
}
