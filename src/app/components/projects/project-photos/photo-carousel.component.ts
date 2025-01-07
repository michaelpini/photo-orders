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

    doubleTap = false;
    pos = {
        storedOffset: {x: 0, y: 0},             // offset after last drag operation
        currentOffset: {x: 0, y: 0},            // current offset while dragging
        dragStart: {x: 0, y: 0},                // position at drag start
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

    dragStart(x: number, y: number) {
        this.dragging.set(true);
        this.pos.dragStart = {x, y};
        this.pos.limitLeft = (1 - this.zoomLevel()) * window.innerWidth;
        this.pos.limitTop = (1 - this.zoomLevel()) * window.innerHeight;
    }

    drag(x: number, y: number) {
        if (this.zoomLevel() === 1) {
            if (x) {
                this.moveX(x);
            }
        } else {
            if (x || y) {
                this.moveXY(x, y);
            }
        }
    }

    dragEnd() {
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
        const dx = screenX - this.pos.dragStart.x;
        const nextPrev = (dx < -deadBandPixels) ? 'next' : (dx > deadBandPixels) ? 'prev' : '';
        this.scheduleNextPrev.set(nextPrev);
        const left = `${dx}px`;
        this.imgStyle.update(x => ({...x, left}));
    }

    moveXY(x: number, y: number) {
        const dx = x - this.pos.dragStart.x;
        const dy = y - this.pos.dragStart.y;
        this.pos.currentOffset.x = limit(this.pos.storedOffset.x + dx, this.pos.limitLeft, 0);
        this.pos.currentOffset.y = limit(this.pos.storedOffset.y + dy, this.pos.limitTop, 0);
        let left = this.pos.currentOffset.x + 'px';
        let top = this.pos.currentOffset.y + 'px';
        this.imgStyle.update(x => ({...x, left, top}));
    }

    // Keyboard events
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

    // Mouse events
    onDblClick(ev?: MouseEvent) {
        const newZoom = this.zoomLevel() === 1 ? 2 : 1;
        this.zoom(newZoom);
    }

    onMouseDown(ev: MouseEvent) {
        ev.preventDefault();
        this.dragStart(ev.screenX, ev.screenY);
    }

    onMouseUp() {
        if (this.dragging()) this.dragEnd();
    }

    onMouseMove(ev: MouseEvent) {
        if (this.dragging()) this.drag(ev.screenX, ev.screenY);
    }

    onMouseLeave() {
        if (this.dragging()) this.dragEnd();
    }

    // Touch events
    onTouchStart(ev: TouchEvent) {
        this.dragStart(ev.touches[0].screenX, ev.touches[0].screenY);
        // if (!this.doubleTap) {
        //     this.doubleTap = true;
        //     setTimeout( () => {
        //         this.doubleTap = false;
        //     }, 300);
        // } else {
        //     this.onDblClick();
        // }
    }

    onTouchMove(ev: TouchEvent) {
        if (this.dragging()) this.drag(ev.touches[0].screenX, ev.touches[0].screenY);
    }

    onTouchEnd() {
        if (this.dragging()) this.dragEnd();
    }

    onContext(ev: MouseEvent) {
        ev.preventDefault();
        const newZoom = this.zoomLevel() === 1 ? 2 : 1;
        this.zoom(newZoom);
    }

}
