import {Routes} from "@angular/router";
import {CustomerDetailComponent} from "../components/customers/customer-detail/customer-detail.component";
import {allowIfNotDirtyGuard} from "../components/nav/allow-if-not-dirty.guard";

export const costumerRoutes: Routes = [
    {path: ':id', component: CustomerDetailComponent, canDeactivate: [allowIfNotDirtyGuard]},
]
