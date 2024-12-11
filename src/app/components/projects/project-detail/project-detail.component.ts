import {
    Component, effect, inject, model, OnDestroy, OnInit, output, signal, ViewChild
} from '@angular/core';
import {NgForm} from "@angular/forms";
import {PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalService} from "../../../modals/modal.service";
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {ToastService} from "../../../shared/toasts/toast.service";
import {Project, ProjectInfo, ProjectInvoice, ProjectQuote} from "../project.model";
import {ProjectDetailInfoComponent} from "./project-detail-info.component";
import {ProjectDetailCostComponent} from "./project-detail-cost.component";
import {ProjectPhotosComponent} from "../project-photos/project-photos.component";

@Component({
    selector: 'project-detail',
    imports: [NgbNavModule, ProjectDetailInfoComponent, ProjectDetailCostComponent, ProjectPhotosComponent],
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
    protected readonly store = inject(PhotoOrdersStore);
    @ViewChild('form', {static: true}) form: NgForm | undefined;
    dataLoaded = signal<Project | null>(null);
    data = signal<Project | null>(null);
    id = model('');  // Will be populated by router :id when projects/:id
    isRendered = output<boolean>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modalService: ModalService,
        private toastService: ToastService,
        ) {
        effect(async () => {
            const id = this.id();
            if (this.store.isInitialized()) {
                setTimeout(() => this.loadProject(id));
            }
        });
    }

    async loadProject(id: string) {
        const selectedProject = this.store.getProject(id);
        this.dataLoaded.set(selectedProject);
        this.data.set(selectedProject);
        this.store.setDirty(false);
        this.store.loadPhotos(id);
    }

    onChangeInfo(data: ProjectInfo) {
        this.data.update(value => {
            if (!value || !data) return null;
            return {...value, ...data};
        })
        this.store.setDirty(true);
    }
    onChangeQuote(data: ProjectQuote) {
        this.data.update(value => {
            if (!value) return null;
            return {...value, quote: {...data}};
        })
        this.store.setDirty(true);
    }
    onChangeInvoice(data: ProjectInvoice) {
        this.data.update(value => {
            if (!value) return null;
            return {...value, invoice: {...data}};
        })
        this.store.setDirty(true);
    }

    async onSave(): Promise<void> {
        const data: Project = this.data() as Project;
        console.log('Save project:', data)
        this.store.setProject(data);
        this.store.setDirty(false);
    }

    onCancel() {
        this.store.setDirty(false);
        this.router.navigate(['../'], {relativeTo: this.route});
    }

    async onDelete() {
        const {projectName} = this.form!.value;
        await this.modalService.confirmDeleteProject(projectName);
        this.store.removeProject(this.id());
        await this.router.navigate(['../'], {relativeTo: this.route});
    }

    ngOnInit(): void {
        this.isRendered.emit(true);
    }

    ngOnDestroy(): void {
        this.isRendered.emit(false);
    }


}
