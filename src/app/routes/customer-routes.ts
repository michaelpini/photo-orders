import {Routes} from "@angular/router";
import {CustomerDetailComponent} from "../customers/customer-detail/customer-detail.component";
import {allowIfNotDirtyGuard} from "../nav/allow-if-not-dirty.guard";

export const costumerRoutes: Routes = [
    {path: ':id', component: CustomerDetailComponent, canDeactivate: [allowIfNotDirtyGuard]},
]
