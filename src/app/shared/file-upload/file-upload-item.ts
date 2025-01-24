import {Component, computed, effect, ElementRef, input, OnDestroy, OnInit, output, signal} from "@angular/core";
import { UploadMetadata, UploadTask} from "firebase/storage";
import {NgbProgressbar, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {FileSizePipe} from "../file-size.pipe";
import {FirebaseService, UploadState} from "../../persistance/firebase.service";
import {ExtendedTaskState} from "./file-upload.component";
import {TruncatePipe} from "../truncate.pipe";

@Component({
    selector: "upload-item",
    templateUrl: "./file-upload-item.html",
    styleUrl: "./file-upload-item.scss",
    imports: [NgbProgressbar, FileSizePipe, TruncatePipe, NgbTooltip],
})
export class FileUploadItem implements OnInit, OnDestroy  {
    file = input<File>();
    path = input<string>('');
    metadata = input<UploadMetadata>({customMetadata: {tag: 'default'}});
    triggerUpload = input<boolean>(false);
    allowRemove = input<boolean>(true);

    progressPercent = signal<number>(0);
    state = signal<ExtendedTaskState>('queued');

    title = computed(() => {
        const fileName = this.file()?.name || '';
        return (fileName.length >= 30) ? fileName : '';
    })
    removeVisible = computed(() => {
        return this.allowRemove() &&
            (this.state() === 'queued' || this.state() === 'paused' || this.state() === 'running');
    })

    sizeUploadedChanged = output<number>();
    statusChanged = output<ExtendedTaskState>();
    success = output<UploadState>();
    remove = output<boolean>();

    uploadTask: UploadTask | null = null;

    constructor(private element: ElementRef, private firebaseService: FirebaseService,) {
        effect(() => {
            if (this.triggerUpload()) {
               this.uploadTask ? this.uploadTask.resume() : this.uploadTask = this.upload();
            } else {
                if (this.uploadTask) this.uploadTask.pause();
            }
        });
    }

    onRemove() {
        if (this.uploadTask) this.uploadTask.cancel();
        this.remove.emit(true);
    }

    upload() {
        if (!this.file() || !this.path()) return null;
        const response = this.firebaseService.uploadImage(this.file()!, this.path(), this.metadata());
        response.uploadStatus.subscribe(status => {
            if (this.state() !== status.state) {
                this.state.set(status.state)
                this.statusChanged.emit(this.state());
            }
            if (status.progressPercentage && status.bytesTransferred) {
                this.progressPercent.set(status.progressPercentage);
                this.sizeUploadedChanged.emit(status.bytesTransferred);
            }
            if (status.state === 'success') {
                this.success.emit(status);
            }
        })
        return response.uploadTask;
    }

    ngOnInit(): void {
        this.statusChanged.emit(this.state());
    }

    ngOnDestroy(): void {
        if (this.uploadTask) this.uploadTask.cancel();
    }

}
