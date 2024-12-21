import {Component, computed, inject, input, signal} from '@angular/core';
import {ProjectInfo} from "../project.model";
import {FormsModule} from "@angular/forms";
import {ModalService, Photo} from "../../../modals/modal.service";
import {PhotoExtended, PhotoOrdersStore} from "../../../store/photoOrdersStore";
import {PhotoItemComponent} from "./photo-item.component";
import {FirebaseService} from "../../../persistance/firebase.service";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {PhotoCarouselComponent} from "./photo-carousel.component";
import {transformSize} from "../../../shared/util";
import {UnitsPipe} from "../../../shared/units.pipe";

type FilterKey = 'liked' | 'selected' | null;

@Component({
    selector: 'project-photos',
    imports: [FormsModule, PhotoItemComponent, NgbDropdown, NgbDropdownMenu, NgbDropdownItem, NgbDropdownToggle, PhotoCarouselComponent, NgbTooltip, UnitsPipe],
    templateUrl: './project-photos.component.html',
    styleUrl: './project-photos.component.scss'
})
export class ProjectPhotosComponent {
    constructor(private modalService: ModalService, private firebaseService: FirebaseService) {

    }
    protected store = inject(PhotoOrdersStore);
    projectInfo = input<Partial<ProjectInfo>>({});
    showCarousel = signal<PhotoExtended | null>(null);
    filter = signal<FilterKey>(null);

    filteredPhotos = computed(() => {
        const key = this.filter();
        const entities = this.store.photosEntities();
        if (key === null) return entities;
        return entities.filter(photo => photo[key]);
    })

    selectedPhotos = computed(() => {
        return this.store.photosEntities().filter(photo => photo.selected);
    })

    totals = computed(() => {
        let liked = 0;
        let size = 0;
        let selected = this.selectedPhotos().length;
        for (let photo of this.store.photosEntities()) {
            size += photo.size;
            if (photo.liked) liked += 1;
        }
        return {size, liked, selected, count: this.store.photosEntities().length};
    });

    infoText = computed(() => {
        const {count, size, liked, selected} = this.totals();
        const filtered = this.filteredPhotos().length;
        let str = filtered.toString();
        if (filtered < count) str += ` von ${count}`;
        str += count === 1 ? ' Foto' : ' Fotos';
        str += ` (${transformSize(size)})`;
        if (selected) str += `, ${selected} selektiert`;
        if (liked) str += `, ${liked} ${liked === 1 ? ' Favorit' : ' Favoriten'}`;
        return str;
    })

    lastFocusedTile: HTMLElement | null = null;

    onSelectChanged(photo: PhotoExtended) {
        this.store.updatePhoto(null, photo);
    }

    onLikedChanged(photo: PhotoExtended) {
        this.store.updatePhoto(this.projectInfo().id!, photo);
    }

    onFilter(key: FilterKey) {
        this.filter.set(key);
    }

    onSelectAll(selected: boolean) {
        const photosAllSelected = this.store.photosEntities().map(photo => ({...photo, selected}));
        this.store.setAllPhotos(photosAllSelected);
    }

    async onRemoveSelected() {
        await this.modalService.confirmDeletePhotos(this.selectedPhotos());
        this.store.removePhotos(this.projectInfo().id!, this.selectedPhotos());
    }

    async onDownloadMultiple(photos?: Photo[]) {
        const {id: projectId} = this.projectInfo();
        if (!photos) photos = this.selectedPhotos().length > 0 ? this.selectedPhotos(): this.store.photosEntities();
        if (!projectId || photos.length === 0) return;
        const result = await this.modalService.downloadPhotos(projectId, photos);
    }

    async onDownload(photo: Photo) {
        const path = `images/projects/${this.projectInfo().id}`;
        await this.firebaseService.downloadImage(photo.fullName, path, true);
    }

    async uploadPhotos() {
        const {id: projectId, userId} = this.projectInfo();
        if (!projectId || !userId) return;
        const result = await this.modalService.uploadPhotos(projectId, userId);
        console.log(result);
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowRight':
                this.focusNextTile(1)
                break;
            case 'ArrowLeft':
                this.focusNextTile(-1);
                break;
            case 'ArrowDown':
                this.focusNextTile(3);
                break;
            case 'ArrowUp':
                this.focusNextTile(-3);
                break;
            case 'Home':
                this.focusFirstTile();
                break;
            case 'End':
                this.focusLastTile();
                break;
            case 'a':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.onSelectAll(true);
                }
                break;
            case 'Escape':
                this.onSelectAll(false);
                this.filter.set(null);
                break;
        }
    }

    focusNextTile(step = 1) {
        const current: HTMLElement = document.querySelector('photo-item:focus-within>.tile')!;
        const nextIndex = current!.tabIndex + step * 4;
        const nextElement: HTMLElement | null = document.querySelector(`[tabindex="${nextIndex}"]`);
        nextElement?.focus();
    }

    focusFirstTile() {
        const firstPhotoItem: HTMLElement = document.querySelector('photo-item:first-of-type>.tile ')!
        firstPhotoItem.focus();
    }

    focusLastTile() {
        const lastPhotoItem: HTMLElement = document.querySelector('photo-item:last-of-type>.tile ')!
        lastPhotoItem.focus();
    }

    openCarousel(photo: PhotoExtended) {
        this.lastFocusedTile = document.querySelector('.tile:focus-within');
        this.showCarousel.set(photo);
    }

    hideCarousel() {
        this.showCarousel.set(null);
        this.lastFocusedTile?.focus();
    }




}
