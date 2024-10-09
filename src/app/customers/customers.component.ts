import {Component, effect, inject, input, Input, model} from '@angular/core';
import {CustomerListComponent} from "./customer-list/customer-list.component";
import {CustomerDetailComponent} from "./customer-detail/customer-detail.component";
import {ActivatedRoute, Router} from "@angular/router";
import {PhotoStore} from "../store/photoStore";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CustomerListComponent, CustomerDetailComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
    store = inject(PhotoStore);
    constructor(private router: Router) { }
    createUser() {
        this.router.navigate(['signup'])
    }




}
