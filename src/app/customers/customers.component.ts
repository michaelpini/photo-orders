import {Component, signal} from '@angular/core';
import {CustomerListComponent} from "./customer-list/customer-list.component";
import {CustomerDetailComponent} from "./customer-detail/customer-detail.component";
import {NgClass} from "@angular/common";
import {ModalService} from "../modals/modal.service";
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-customers',
    standalone: true, imports: [CustomerListComponent, CustomerDetailComponent, RouterOutlet, NgClass],
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.scss'
})
export class CustomersComponent {
    showDetail = signal(false);
    constructor(private modalService: ModalService) {  }

    async createUser() {
        this.modalService.signUp();
    }
}
