import {Component, effect, ElementRef, input, OnInit, output, signal} from "@angular/core";
import {FileSizePipe} from "../file-size.pipe";
import {FirebaseService} from "../../persistance/firebase.service";
import {DownloadState} from "./file-download.component";
import {PhotoExtended} from "../../store/photoOrdersStore";
import {ExtendedTaskState} from "../file-upload/file-upload.component";

@Component({
    selector: "download-item",
    templateUrl: "./file-download-item.html",
    styles: `.grid {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 1rem;
    }`,
    imports: [FileSizePipe],
})
export class FileDownloadItem implements OnInit  {
    photo = input<PhotoExtended>();
    path = input<string>('');
    triggerDownload = input<boolean>(false);
    state = signal<ExtendedTaskState>('queued');
    statusChanged = output<ExtendedTaskState>();
    done = output<DownloadState>();

    constructor(private element: ElementRef, private firebaseService: FirebaseService,) {
        effect(() => {
            if (this.triggerDownload()) this.download();
        });
    }

    async download() {
        if (!this.photo() || !this.path()) throw new Error('invalid filename or path');
        this.state.set('running');
        try {
            await this.firebaseService.downloadImage(this.photo()!.fullName, this.path(), true);
            this.state.set('success');
            this.statusChanged.emit('success')
            this.done.emit({state: 'success'});
        }
        catch (error) {
            this.state.set('error');
            this.statusChanged.emit('error');
            this.done.emit({state: 'error', error: error as Error});
        }
    }

    ngOnInit(): void {
        this.statusChanged.emit(this.state());
    }

}
