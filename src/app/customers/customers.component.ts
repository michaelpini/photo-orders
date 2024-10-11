import {Component, signal} from '@angular/core';
import {CustomerListComponent} from "./customer-list/customer-list.component";
import {CustomerDetailComponent} from "./customer-detail/customer-detail.component";
import {Router, RouterOutlet} from "@angular/router";
import {NgClass} from "@angular/common";

@Component({
    selector: 'app-customers',
    standalone: true, imports: [CustomerListComponent, CustomerDetailComponent, RouterOutlet, NgClass],
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.scss'
})
export class CustomersComponent {
    showDetail = signal(false);
    constructor(private router: Router) {  }

    createUser() {
        this.router.navigate(['signup'])
    }
}
