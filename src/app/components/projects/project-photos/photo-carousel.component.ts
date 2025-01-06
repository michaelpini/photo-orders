import {Component, computed, effect, ElementRef, input, OnDestroy, output, signal, ViewChild} from '@angular/core';
import {PhotoExtended} from "../../../store/photoOrdersStore";
import {NgbCarousel, NgbCarouselModule, NgbSlideEvent} from "@ng-bootstrap/ng-bootstrap";
import {FileSizePipe} from "../../../shared/file-size.pipe";
import {NgClass, NgStyle} from "@angular/common";
import {limit} from "../../../shared/util";

@Component({
    selector: 'photo-carousel',
    imports: [NgbCarouselModule, FileSizePipe, NgStyle, NgClass],
    templateUrl: './photo-carousel.component.html',
    styleUrl: './photo-carousel.component.scss'
})
export class PhotoCarouselComponent implements OnDestroy{
    @ViewChild('carousel') carousel!: NgbCarousel;
    photos = input<PhotoExtended[]>();
    showWithPhoto = input<PhotoExtended | null>();
    currentGuid = signal<string>('');
    zoomLevel = signal<number>(1);
    imgStyle = signal<{[key: string]: string}>({height: '100%', width: '100%', left: '0', top: '0'});
    scheduleNextPrev = signal<'next' | 'prev' | ''>('');
    dragging = signal<boolean>(false);
    close = output<string>();
    liked = output<PhotoExtended>();
    sizes = computed(() => {
        const percent = this.zoomLevel() * 100;
        return `min(${percent}vw, ${percent}vh)`
    });

    pos = {
        storedOffset: {x: 0, y: 0},             // offset after last drag operation
        currentOffset: {x: 0, y: 0},            // current offset while dragging
        dragStart: {screenX: 0, screenY: 0},    // position at drag start
        limitLeft: 0,                           // limit for pos.left in px
        limitTop: 0,                            // limit for pos.top in px
    }


    constructor(elementRef: ElementRef<HTMLElement>) {
        document.body.classList.add('overflow-hidden');
        effect(() => {
            setTimeout(() => {
                this.carousel.focus();
            })
        })

    }

    ngOnDestroy(): void {
        document.body.classList.remove('overflow-hidden');
    }

    onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                (this.zoomLevel() === 1) ? this.onClose() : this.resetZoom();
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
        this.resetZoom();
    }

    onDblClick() {
        const newZoom = this.zoomLevel() === 1 ? 2 : 1;
        this.zoom(newZoom);
    }

    zoom(zoom: number = 1) {
        this.pos.storedOffset.x = (1 - zoom) * window.innerWidth / 2;
        this.pos.storedOffset.y = (1 - zoom) * window.innerHeight / 2;
        this.zoomLevel.set(zoom);
        this.imgStyle.set({
            width: zoom * 100 +'%',
            height: zoom * 100 +'%',
            left: this.pos.storedOffset.x + 'px',
            top: this.pos.storedOffset.y + 'px',
        });
    }

    resetZoom() {
        this.zoomLevel.set(1);
        this.imgStyle.set({height: '100%', width: '100%', left: '0', top: '0'});
    }

    onDragStart(ev: MouseEvent) {
        this.dragging.set(true);
        const {screenX, screenY} = ev;
        this.pos.dragStart = {screenX, screenY};
        this.pos.limitLeft = (1 - this.zoomLevel()) * window.innerWidth;
        this.pos.limitTop = (1 - this.zoomLevel()) * window.innerHeight;
    }

    onDrag(ev: MouseEvent) {
        if (this.zoomLevel() === 1) {
            if (ev.screenX) {
                this.moveX(ev.screenX);
            }
        } else {
            if (ev.screenX || ev.screenY) {
                this.moveXY(ev.screenX, ev.screenY);
            }
        }
    }

    onDragEnd() {
        if (this.zoomLevel() === 1) {
            this.resetZoom();
            if (this.scheduleNextPrev() === 'next') this.carousel.next();
            if (this.scheduleNextPrev() === 'prev') this.carousel.prev();
            this.scheduleNextPrev.set('');
        } else {
            this.pos.storedOffset.x = this.pos.currentOffset.x;
            this.pos.storedOffset.y = this.pos.currentOffset.y;
        }
        this.dragging.set(false);
    }

    moveX(screenX: number) {
        const deadBandPixels = window.innerWidth * 0.1;
        const dx = screenX - this.pos.dragStart.screenX;
        const nextPrev = (dx < -deadBandPixels) ? 'next' : (dx > deadBandPixels) ? 'prev' : '';
        this.scheduleNextPrev.set(nextPrev);
        const left = `${dx}px`;
        this.imgStyle.update(x => ({...x, left}));
    }

    moveXY(screenX: number, screenY: number) {
        const dx = screenX - this.pos.dragStart.screenX;
        const dy = screenY - this.pos.dragStart.screenY;
        this.pos.currentOffset.x = limit(this.pos.storedOffset.x + dx, this.pos.limitLeft, 0);
        this.pos.currentOffset.y = limit(this.pos.storedOffset.y + dy, this.pos.limitTop, 0);
        let left = this.pos.currentOffset.x + 'px';
        let top = this.pos.currentOffset.y + 'px';
        this.imgStyle.update(x => ({...x, left, top}));
    }

    mouseDown(ev: MouseEvent) {
        ev.preventDefault();
        this.onDragStart(ev);
    }

    mouseUp() {
        if (this.dragging()) this.onDragEnd();
    }

    mouseMove(ev: MouseEvent) {
        if (this.dragging()) this.onDrag(ev);
    }

    onMouseLeave() {
        if (this.dragging()) this.onDragEnd();

    }
}
