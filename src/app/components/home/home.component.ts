import {Component, inject, signal} from '@angular/core';
import {Toast, ToastService} from "../../shared/toasts/toast.service";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ModalService} from "../../modals/modal.service";
import {PictureItemComponent} from "./picture-item.component";

@Component({
    selector: 'app-home',
    imports: [
        PictureItemComponent
    ],
    styleUrl: './home.component.scss',
    templateUrl: './home.component.html',
})
export class HomeComponent {
    protected store = inject(PhotoOrdersStore);
    readonly baseUrl = signal('https://firebasestorage.googleapis.com/v0/b/photo-orders-12b89.firebasestorage.app/o/images%2Fportfolio%2F')
    constructor(private modalService: ModalService) { }

    onSignIn() {
        this.modalService.signIn();
    }


}
