import {Component, computed, ElementRef, input, output, signal} from "@angular/core";
import {PhotoExtended} from "../../../store/photoOrdersStore";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'photo-item',
    templateUrl: './photo-item.component.html',
    imports: [
        FormsModule,
    ],
    styleUrl: './photo-item.component.scss'
})
export class PhotoItemComponent {
    constructor(private elementRef: ElementRef) {
        this.width.set(elementRef.nativeElement.getBoundingClientRect().width);
    }
    photo = input<PhotoExtended>();
    index = input<number>();

    selected = output<PhotoExtended>();
    liked = output<PhotoExtended>();
    viewInCarousel = output<PhotoExtended>();
    download = output<PhotoExtended>();

    width = signal(300);

    height = computed(() => {
        const {width, height} = this.photo() || {width: 400, height: 300};
        const ratio= width / height;
        return this.width() * ratio;
    })

    onSelectedChanged(ev: Event) {
        const selected = (ev.target as HTMLInputElement).checked;
        const updatedPhoto = {...this.photo()!, selected};
        this.selected.emit(updatedPhoto);
    }

    onLikedChanged(ev: Event) {
        const liked = (ev.target as HTMLInputElement).checked;
        const updatedPhoto = {...this.photo()!, liked};
        this.liked.emit(updatedPhoto);
    }

    onDownload() {
        this.download.emit(this.photo()!);
    }

    onDblClick() {
        this.viewInCarousel.emit(this.photo()!);
    }

    onKeydown(event: KeyboardEvent) {
        let photo = {...this.photo()!};
        switch (event.key) {
            case 'Enter':
                this.viewInCarousel.emit(this.photo()!);
                break;
            case ' ':
                event.preventDefault();
                event.stopPropagation();
                photo.selected = !photo.selected;
                this.selected.emit(photo);
                break;
            case 'h':
                photo.liked = !photo.liked;
                this.selected.emit(photo);
                break;
        }
    }
}
