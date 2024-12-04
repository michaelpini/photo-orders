import {Component, effect, ElementRef, input, OnDestroy, OnInit, output, signal} from "@angular/core";
import {getDownloadURL, ref, uploadBytesResumable, UploadMetadata, UploadTask} from "firebase/storage";
import {storage} from "../../../main";
import {UploadStatus} from "./file-upload.component";
import {NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";
import {FileSizePipe} from "../file-size.pipe";

@Component({
    selector: "upload-item",
    templateUrl: "./file-upload-item.html",
    styleUrl: "./file-upload-item.scss",
    imports: [NgbProgressbar, FileSizePipe],
})
export class FileUploadItem implements OnInit, OnDestroy  {
    file = input<File>();
    path = input<string>('');
    metadata = input<UploadMetadata>({customMetadata: {tag: 'default'}});
    triggerUpload = input<boolean>(false);
    progressPercent = signal<number>(0);
    status = signal<UploadStatus>('queued');
    sizeUploadedChanged = output<number>();
    progressPercentageChanged = output<number>();
    statusChanged = output<UploadStatus>();
    downloadUrlChanged = output<string>();

    uploadTask: UploadTask | null = null;

    constructor(private element: ElementRef) {
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
        const storageRef = ref(storage, this.path() + this.file()!.name);
        const uploadTask = uploadBytesResumable(storageRef, this.file()!, this.metadata());
        uploadTask.on('state_changed',
            (snapshot) => {
                switch (snapshot.state) {
                    case 'paused':
                        this.status.set('paused');
                        break;
                    case 'running':
                        this.status.set('uploading');
                        break;
                }
                this.progressPercent.set((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                this.statusChanged.emit(this.status());
                this.progressPercentageChanged.emit(this.progressPercent());
                this.sizeUploadedChanged.emit(snapshot.bytesTransferred);
            },
            error => {
                this.status.set('failed');
                this.statusChanged.emit(this.status());
                console.log('Upload failed: ', error);
            },
            async () => {
                this.status.set('complete');
                this.statusChanged.emit(this.status());
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                this.downloadUrlChanged.emit(downloadUrl);
            }
        )
        return uploadTask;
    }

    ngOnInit(): void {
        this.statusChanged.emit(this.status());
    }

    ngOnDestroy(): void {
        if (this.uploadTask) this.uploadTask.cancel();
    }

}
