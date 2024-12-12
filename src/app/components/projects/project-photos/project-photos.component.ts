import {Component, computed, inject, input, output, signal} from '@angular/core';
import {ProjectInfo} from "../project.model";
import {FormsModule} from "@angular/forms";
import {ModalService, Photo} from "../../../modals/modal.service";
import {PhotoExtended, PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {PhotoItemComponent} from "./photo-item.component";
import {FirebaseService} from "../../../persistance/firebase.service";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {PhotoCarouselComponent} from "./photo-carousel.component";

@Component({
    selector: 'project-photos',
    imports: [FormsModule, PhotoItemComponent, NgbDropdown, NgbDropdownMenu, NgbDropdownItem, NgbDropdownToggle, PhotoCarouselComponent],
    templateUrl: './project-photos.component.html',
    styleUrl: './project-photos.component.scss'
})
export class ProjectPhotosComponent {
    constructor(private modalService: ModalService, private firebaseService: FirebaseService) {

    }
    protected store = inject(PhotoOrdersStore);
    projectInfo = input<Partial<ProjectInfo>>({});
    showCarousel = signal<PhotoExtended | null>(null);
    selectedPhotos: PhotoExtended[] = [];


    filteredPhotos = computed(() => {
        return this.store.photosEntities();
    })

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

    onLiked(photo: PhotoExtended, liked?: boolean) {
        const updatedPhoto = (liked === undefined) ? photo : {...photo, liked}
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

    openCarousel(photo: PhotoExtended) {
        this.showCarousel.set(photo);
    }

    hideCarousel() {
        this.showCarousel.set(null);
    }
}
