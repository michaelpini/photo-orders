import {
    Component, effect, inject, model, OnDestroy, OnInit, output, signal
} from '@angular/core';
import {PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalService} from "../../../modals/modal.service";
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {ToastService} from "../../../shared/toasts/toast.service";
import {Project, ProjectInfo, ProjectInvoice, ProjectQuote} from "../project.model";
import {ProjectDetailInfoComponent} from "./project-detail-info.component";
import {ProjectDetailCostComponent} from "./project-detail-cost.component";
import {ProjectPhotosComponent} from "../project-photos/project-photos.component";
import {DocxTemplaterService} from "../../../shared/docxtemplater.service";
import {FirebaseService} from "../../../persistance/firebase.service";
import {UploadMetadata} from "firebase/storage";

@Component({
    selector: 'project-detail',
    imports: [NgbNavModule, ProjectDetailInfoComponent, ProjectDetailCostComponent, ProjectPhotosComponent],
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
    protected readonly store = inject(PhotoOrdersStore);
    dataLoaded = signal<Project | null>(null);
    data = signal<Project | null>(null);
    id = model('');  // Will be populated by router :id when projects/:id
    isRendered = output<boolean>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modalService: ModalService,
        private toastService: ToastService,
        private docxTemplaterService: DocxTemplaterService,
        private firebaseService: FirebaseService,
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
        await this.modalService.confirmDeleteProject(this.data()?.projectName || 'Current project');
        this.store.removeProject(this.id());
        await this.router.navigate(['../'], {relativeTo: this.route});
    }

    async onDocx(type: 'quote' | 'invoice') {
        if (type === 'quote') {
            await this.docxTemplaterService.generateQuote(this.data()!)
            this.toastService.showSuccess('Offerte erstellt (im Download Verzeichnis gespeichert');
        } else {
            await this.docxTemplaterService.generateInvoice(this.data()!)
            this.toastService.showSuccess('Rechnung erstellt (im Download Verzeichnis gespeichert');
        }
    }

    onAttach(type: 'quote' | 'invoice') {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf';
            input.multiple = false;
            input.onchange = _ => {
                let files: File[] = Array.from(input.files || []);
                const file = files[0];
                const path = `documents/projects/${this.data()?.id}/`;
                const metadata: UploadMetadata = {customMetadata: {userId: this.data()!.userId!, projectId: this.id()}};
                const upload = this.firebaseService.uploadFile(file, path, metadata);
                upload.uploadStatus.subscribe(uploadState => {
                    if (uploadState.state === 'success') {
                        const data: Project = {id: this.id()!};
                        if (type === 'quote') data['quote'] = {pdf: file.name};
                        if (type === 'invoice') data['invoice'] = {pdf: file.name};
                        this.store.updateProject(data);
                    }
                })
            };
            input.click();
    }

    onDownloadPDF(type: 'quote' | 'invoice') {
        const filename = (type === 'quote') ? this.data()?.quote?.pdf : this.data()?.invoice?.pdf;
        if (!filename) return;
        const path = `documents/projects/${this.data()?.id}/${filename}`;
        this.firebaseService.downloadFile(path);
    }



    ngOnInit(): void {
        this.isRendered.emit(true);
    }

    ngOnDestroy(): void {
        this.isRendered.emit(false);
    }


}
