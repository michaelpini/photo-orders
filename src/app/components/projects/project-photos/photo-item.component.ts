import {Component, computed, ElementRef, input, output, signal} from "@angular/core";
import {PhotoExtended} from "../../../store/photoOrdersStore";
import {FormsModule} from "@angular/forms";
import {Photo} from "../../../modals/modal.service";


@Component({
    selector: 'photo-item',
    templateUrl: './photo-item.component.html',
    imports: [
        FormsModule,
    ],
    styleUrl: './photo-item.component.scss'
})
export class PhotoItemComponent {
    photo = input<PhotoExtended>();
    index = input<number>();
    selected = output<boolean>();
    liked = output<boolean>();
    download = output<Photo>()
    width = signal(300);

    constructor(private elementRef: ElementRef) {
        this.width.set(elementRef.nativeElement.getBoundingClientRect().width);
    }

    height = computed(() => {
        const {width, height} = this.photo() || {width: 400, height: 300};
        const ratio= width / height;
        return this.width() * ratio;
    })
    onSelectedChanged(selected: boolean) {
        this.selected.emit(selected);
    }

    onLikedChanged(ev: Event) {
        let liked = (ev.target as HTMLInputElement).checked;
        this.liked.emit(liked);
    }

    onDownload() {
        this.download.emit(this.photo()!);
    }

}
