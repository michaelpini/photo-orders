import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {FirebaseService} from "../../persistance/firebase.service";
import {NgClass} from "@angular/common";
import {ProjectListComponent} from "./project-list/project-list.component";
import {Project} from "./project.model";
import {delay} from "../../shared/util";

@Component({
    selector: 'app-projects',
    imports: [RouterOutlet, NgClass, ProjectListComponent],
    templateUrl: './projects.component.html',
    styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
    protected store = inject(PhotoOrdersStore);
    showDetail = signal(false);
    hideListAndHeader = signal(false);

    constructor(private firebaseService: FirebaseService, private router: Router) {
    }

    async createProject() {
        try {
            const template: Partial<Project> = {
                projectName: '<NEUES PROJEKT>',
                quote: {},
                invoice: {}
            };
            this.store.setBusy();
            const newProject: Project = await this.firebaseService.addProject(template);
            this.store.setProject(newProject);
            await delay(100);
            this.store.setIdle();
            await this.router.navigate(['/projects/' + newProject.id]);
        } catch (err) {
            this.store.setError((err as Error).message);
        }
    }

    toggleDetailsFullscreen() {
        this.hideListAndHeader.update(value => !value);
    }
}
