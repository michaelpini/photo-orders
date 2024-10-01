import { Component } from '@angular/core';
import {CustomerListComponent} from "./customer-list/customer-list.component";
import {CustomerDetailComponent} from "./customer-detail/customer-detail.component";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CustomerListComponent,
    CustomerDetailComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {

}
