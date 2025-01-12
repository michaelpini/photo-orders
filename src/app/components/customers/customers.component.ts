import {Component, inject, signal} from '@angular/core';
import {CustomerListComponent} from "./customer-list/customer-list.component";
import {NgClass} from "@angular/common";
import {Router, RouterOutlet} from "@angular/router";
import {User} from "./user.model";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {FirebaseService} from "../../persistance/firebase.service";

@Component({
    selector: 'app-customers',
    imports: [CustomerListComponent, RouterOutlet, NgClass],
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.scss'
})
export class CustomersComponent {
    protected store = inject(PhotoOrdersStore);
    showDetail = signal(false);
    constructor(private firebaseService: FirebaseService, private router: Router) {  }

    async createUser() {
        try {
            const template = {
                firstName: '<NEUER>',
                lastName:'<KUNDE>',
                customerNumber: this.store.getNewCustomerNumber(),
            };
            this.store.setBusy();
            const newUser: User = await this.firebaseService.addUser(template);
            this.store.setUser(newUser);
            this.store.setIdle();
            await this.router.navigate(['/customers/' + newUser.id]);
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }
}
