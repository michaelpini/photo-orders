import {Component, effect, input, signal} from '@angular/core';
import {ProjectInfo} from "../project.model";
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../../../../main';
import {FormsModule} from "@angular/forms";
import {ModalService} from "../../../modals/modal.service";
import {NgbModalConfig} from "@ng-bootstrap/ng-bootstrap";

export interface ImageLink {
    name: string;
    urlMedium: string;
    urlLarge: string;
    urlFull: string;
}

@Component({
    selector: 'project-photos',
    imports: [ FormsModule ],
    templateUrl: './project-photos.component.html',
    styleUrl: './project-photos.component.scss'
})
export class ProjectPhotosComponent {
    async uploadPhotos() {
        const {id: projectId, userId} = this.projectInfo();
        if (!projectId || !userId) return;
        const result = await this.modalService.uploadPhotos(projectId, userId);
        console.log(result);
    }
    projectInfo = input<Partial<ProjectInfo>>({});
    projectImages = signal<ImageLink[]>([]);

    constructor(private modalService: ModalService) {
        effect(() => {
            const projectId = this.projectInfo().id;
            if (projectId) this.loadProjectPhotos(projectId);
        });
    }

    async loadProjectPhotos(projectId: string) {
        const listRef = ref(storage, `images/projects/${projectId}`);
        let imageLinks: ImageLink[] = [];
        const listResult = await listAll(listRef);
        if (listResult.items.length > 0) {
            const image1Link = await getDownloadURL(listResult.items[0]);
            const base = image1Link.split('/images')[0] + '/';
            listResult.items.forEach((itemRef) => {
                const pos = itemRef.name.lastIndexOf('.');
                const filename = itemRef.name.substring(0, pos);
                const extension = itemRef.name.substring(pos);
                const urlBase = `images/projects/${projectId}`;
                const urlThumbBase = `${urlBase}/thumbnails/${filename}`;
                const urlMedium = base + encodeURIComponent(`${urlThumbBase}_600x600${extension}`) + '?alt=media';
                const urlLarge = base + encodeURIComponent(`${urlThumbBase}_2000x2000${extension}`) + '?alt=media';
                const urlFull = base + encodeURIComponent(`${urlBase}/${itemRef.name}`) + '?alt=media';
                const item = {
                    name: itemRef.name,
                    urlMedium,
                    urlLarge,
                    urlFull
                }
                imageLinks.push(item);
            });
            console.log(imageLinks);
        }
        this.projectImages.set(imageLinks);

    }

}
