import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {FirebaseService} from "../../persistance/firebase.service";
import {NgClass} from "@angular/common";
import {ProjectListComponent} from "./project-list/project-list.component";
import {Project} from "./project.model";

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterOutlet, NgClass, ProjectListComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  protected store = inject(PhotoOrdersStore);
  showDetail = signal(false);
  constructor(private firebaseService: FirebaseService, private router: Router) {  }

  async createProject() {
    try {
      const template = {projectName: '<NEUES PROJEKT>'};
      this.store.setBusy();
      const newProject: Project = await this.firebaseService.addProject(template);
      this.store.setProject(newProject);
      this.store.setIdle();
      await this.router.navigate(['/projects/' + newProject.id]);
    } catch (err) {
      this.store.setError((err as Error).message);
    }
  }

}
