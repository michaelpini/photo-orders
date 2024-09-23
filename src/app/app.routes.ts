import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {SignInComponent} from "./auth/sign-in.component";

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'signin', component: SignInComponent},
    {path: 'account',
        loadComponent: () => import('./account/account.component').then(m => m.AccountComponent),},
    {path: 'customers',
        loadComponent: () => import('./customers/customers.component').then(m => m.CustomersComponent),},
    {path: 'projects',
        loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent),},
];
