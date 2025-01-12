import {Routes} from '@angular/router';
import {HomeComponent} from "../components/home/home.component";
import {allowIfAdminGuard} from "../components/nav/allow-if-admin.guard";
import {allowIfNotDirtyGuard} from "../components/nav/allow-if-not-dirty.guard";
import {allowIfAuthenticatedGuard} from "../components/nav/allow-if-authenticated.guard";

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'account', canDeactivate: [allowIfNotDirtyGuard],
        loadComponent: () => import('../components/account/account.component').then(m => m.AccountComponent),
    },
    {path: 'customers', canActivate: [allowIfAdminGuard],
        loadComponent: () => import('../components/customers/customers.component').then(m => m.CustomersComponent),
        loadChildren: () => import('./customer-routes').then(m => m.costumerRoutes),
    },
    {path: 'projects', canActivate: [allowIfAuthenticatedGuard],
        loadComponent: () => import('../components/projects/projects.component').then(m => m.ProjectsComponent),
        loadChildren: () => import('./project-routes').then(m => m.projectRoutes),
    },
    {path: '404',
        loadComponent: () => import('../components/nav/not-found-404.component').then(m => m.NotFoundComponent),
    },
    {path: 'signup/:userId',
        loadComponent: () => import('../components/account/account-signup.component').then(m => m.AccountSignupComponent),
    },
    {path: 'dashboard', canActivate: [allowIfAdminGuard],
        loadComponent: () => import('../components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    },
    {path: '**', redirectTo: '404', pathMatch: 'full'},
];

