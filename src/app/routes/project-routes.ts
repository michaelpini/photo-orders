import {Routes} from "@angular/router";
import {allowIfNotDirtyGuard} from "../components/nav/allow-if-not-dirty.guard";
import {ProjectDetailComponent} from "../components/projects/project-detail/project-detail.component";

export const projectRoutes: Routes = [
    {path: ':id', component: ProjectDetailComponent, canDeactivate: [allowIfNotDirtyGuard]},
]
