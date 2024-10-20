import {Routes} from '@angular/router';
import {HomeComponent} from "../home/home.component";
import {allowIfAdminGuard} from "../nav/allow-if-admin.guard";

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'account',
        loadComponent: () => import('../account/account.component').then(m => m.AccountComponent),
    },
    {path: 'customers', canActivate: [allowIfAdminGuard],
        loadComponent: () => import('../customers/customers.component').then(m => m.CustomersComponent),
        loadChildren: () => import('./customer-routes').then(m => m.costumerRoutes),
    },
    {path: 'projects', canActivate: [allowIfAdminGuard],
        loadComponent: () => import('../projects/projects.component').then(m => m.ProjectsComponent),
    },
    {path: '404',
        loadComponent: () => import('../nav/not-found-404.component').then(m => m.NotFoundComponent),
    },
    {path: '**', redirectTo: '404', pathMatch: 'full'},
];

