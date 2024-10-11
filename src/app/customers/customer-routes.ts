import {Routes} from "@angular/router";
import {CustomerDetailComponent} from "./customer-detail/customer-detail.component";

export const costumerRoutes: Routes = [
    {path: ':id', component: CustomerDetailComponent},
]
