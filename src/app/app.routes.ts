import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {AuthComponent} from "./auth/auth.component";

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'signin', component: AuthComponent},
    {path: 'signup', component: AuthComponent},
    {path: 'account',
        loadComponent: () => import('./account/account.component').then(m => m.AccountComponent),
    },
    {path: 'customers',
        loadComponent: () => import('./customers/customers.component').then(m => m.CustomersComponent),
        loadChildren: () => import('./customers/customer-routes').then(m => m.costumerRoutes),
    },
    {path: 'projects',
        loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent),
    },
];

