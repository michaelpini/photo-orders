import {Component, effect, ElementRef, input, OnDestroy, OnInit, output, signal} from "@angular/core";
import { UploadMetadata, UploadTask} from "firebase/storage";
import {NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";
import {FileSizePipe} from "../file-size.pipe";
import {FirebaseService, UploadState} from "../../persistance/firebase.service";
import {ExtendedTaskState} from "./file-upload.component";

@Component({
    selector: "upload-item",
    templateUrl: "./file-upload-item.html",
    styles: `.grid {
        display: grid;
        grid-template-columns: 1fr auto 4rem auto;
        align-items: center;
        gap: 1rem;
    }`,
    imports: [NgbProgressbar, FileSizePipe],
})
export class FileUploadItem implements OnInit, OnDestroy  {
    file = input<File>();
    path = input<string>('');
    metadata = input<UploadMetadata>({customMetadata: {tag: 'default'}});
    triggerUpload = input<boolean>(false);
    progressPercent = signal<number>(0);
    state = signal<ExtendedTaskState>('queued');
    sizeUploadedChanged = output<number>();
    statusChanged = output<ExtendedTaskState>();
    success = output<UploadState>();

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

    upload() {
        if (!this.file() || !this.path()) return null;
        const response = this.firebaseService.uploadImage(this.file()!, this.path(), this.metadata());
        response.uploadStatus.subscribe(status => {
            console.log('uploadStatus' ,status);
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
