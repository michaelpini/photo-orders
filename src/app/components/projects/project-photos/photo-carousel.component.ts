import {Component, effect, ElementRef, input, OnDestroy, output, signal, ViewChild} from '@angular/core';
import {PhotoExtended} from "../../../store/photoOrdersStore";
import {NgbCarousel, NgbCarouselModule, NgbSlideEvent} from "@ng-bootstrap/ng-bootstrap";
import {FileSizePipe} from "../../../shared/file-size.pipe";

@Component({
    selector: 'photo-carousel',
    imports: [NgbCarouselModule, FileSizePipe],
    templateUrl: './photo-carousel.component.html',
    styleUrl: './photo-carousel.component.scss'
})
export class PhotoCarouselComponent implements OnDestroy{
    photos = input<PhotoExtended[]>();
    showWithPhoto = input<PhotoExtended | null>();
    currentGuid = signal<string>('');
    close = output<string>();
    liked = output<PhotoExtended>();
    @ViewChild('carousel') carousel!: NgbCarousel;


    constructor(elementRef: ElementRef<HTMLElement>) {
        document.body.classList.add('overflow-hidden');
        effect(() => {
            setTimeout(() => {
                const carousel = this.carousel;
                carousel.focus();
            })
        })

    }

    ngOnDestroy(): void {
        document.body.classList.remove('overflow-hidden');
    }

    onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                this.onClose();
                break;
            case 'Home':
                this.carousel.select(this.photos()![0].fileName);
                break;
            case 'End':
                this.carousel.select(this.photos()![this.photos()!.length - 1].fileName);
                break;
            case ' ':
                const photo = this.photos()!.find(photo => photo.guid === this.currentGuid())!;
                photo.liked = !photo.liked;
                this.liked.emit(photo);
                break;
            default:
        }
    }

    onClose() {
        this.close.emit(this.currentGuid());
    }

    onLikedChanged(ev: Event, photo: PhotoExtended) {
        let liked = (ev.target as HTMLInputElement).checked;
        this.liked.emit({...photo, liked});
    }

    onSlide(ev: NgbSlideEvent) {
        this.currentGuid.set(ev.current);

    }

}
