import {Component, computed, inject, input} from '@angular/core';
import {ProjectInfo} from "../project.model";
import {FormsModule} from "@angular/forms";
import {ModalService, Photo} from "../../../modals/modal.service";
import {PhotoExtended, PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {PhotoItemComponent} from "./photo-item.component";
import {FirebaseService} from "../../../persistance/firebase.service";

@Component({
    selector: 'project-photos',
    imports: [FormsModule, PhotoItemComponent],
    templateUrl: './project-photos.component.html',
    styleUrl: './project-photos.component.scss'
})
export class ProjectPhotosComponent {
    protected store = inject(PhotoOrdersStore);
    projectInfo = input<Partial<ProjectInfo>>({});
    selectedPhotos: PhotoExtended[] = [];


    constructor(private modalService: ModalService, private firebaseService: FirebaseService) { }

    totals = computed(() => {
        let totalLiked = 0;
        let totalSize = 0;
        for (let photo of this.store.photosEntities()) {
            totalSize += photo.size;
            if (photo.liked) totalLiked += 1;
        }
        return {totalSize, totalLiked, count: this.store.photosEntities().length};
    });

    onSelect(selected: boolean, photo: PhotoExtended) {

    }

    onLiked(liked: boolean, photo: PhotoExtended) {
        const updatedPhoto = {...photo, liked}
        this.store.updatePhoto(this.projectInfo().id!, updatedPhoto);
    }

    onDownload(photo: Photo) {
        const path = `images/projects/${this.projectInfo().id}`;
        this.firebaseService.downloadImage(photo.fullName, path, true);
    }

    async uploadPhotos() {
        const {id: projectId, userId} = this.projectInfo();
        if (!projectId || !userId) return;
        const result = await this.modalService.uploadPhotos(projectId, userId);
        console.log(result);
    }

}
