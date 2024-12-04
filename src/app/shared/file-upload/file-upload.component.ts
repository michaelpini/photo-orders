import {Component, computed, input, OnDestroy, signal, WritableSignal} from '@angular/core';
import {NgbActiveModal, NgbModalConfig, NgbProgressbar, NgbProgressbarStacked} from '@ng-bootstrap/ng-bootstrap';
import {FileUploadItem} from "./file-upload-item";
import {UploadMetadata} from "firebase/storage";
import {FileSizePipe} from "../file-size.pipe";
import {config} from "rxjs";

export type UploadStatus = 'queued' | 'uploading' | 'paused' | 'complete' | 'failed';
export interface ModalUploadConfig {
    title?: string;
    message?: string;
    btnUploadText?: string;
    btnResumeText?: string;
    btnCancelText?: string;
    btnPauseText?: string;
    btnCloseText?: string;
    btnClass?: string;
    path: string;
    metadata: UploadMetadata
    maxConcurrentUploads?: number;
}
interface Status {
    filename: string;
    sizeUploaded: number;
    sizeTotal: number;
    status: UploadStatus;
    triggerUpload: WritableSignal<boolean>;
}

const defaultConfig: ModalUploadConfig = {
    title: 'Dateien hochladen',
    message: '',
    btnUploadText: 'Hochladen',
    btnResumeText: 'Fortfahren',
    btnCancelText: 'Abbrechen',
    btnCloseText: 'Schliessen',
    btnPauseText: 'Pause',
    btnClass: 'btn-primary',
    path: '',
    metadata: {customMetadata: {resolution: 'full', userId: ''}},
    maxConcurrentUploads: 5
}

@Component({
    selector: 'file-upload',
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.scss',
    imports: [FileUploadItem, FileSizePipe, NgbProgressbar, NgbProgressbarStacked],
})
export class FileUploadComponent implements OnDestroy {
    config = signal<ModalUploadConfig>(defaultConfig);
    uploadFiles = signal<File[]>([]);
    isUploading = signal(false);
    isCompleted = signal(false);
    progressUploaded = signal(0);
    progressFailed = signal(0);
    progressPercentage = signal(0);

    sizeTotalQueued = computed(() => {
        return this.uploadFiles().reduce((acc, file) => {
            acc += file.size;
            return acc;
        }, 0)
    })
    btnOkText = computed<string>(() => {
        if (this.isUploading()) return 'Hochladen...';
        if (this.progressPercentage() > 0 && !this.isCompleted()) return 'Fortfahren';
        return 'Hochladen'
    })
    btnCancelText = computed<string>(() => {
        if (this.isUploading()) return 'Pause';
        if (this.isCompleted()) return 'Schliessen';
        return 'Abbrechen';
    })

    statusArray: Status[] = [];

    constructor(public modal: NgbActiveModal, private modalConfig: NgbModalConfig) { }

    configure(config: ModalUploadConfig) {
        const updatedConfig = {...defaultConfig, ...config};
        this.config.set(updatedConfig);
    }

    selectFiles() {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg';
        input.multiple = true;
        input.onchange = _ => {
            let files: File[] = Array.from(input.files || []);
            this.uploadFiles.set(files);
            this.statusArray = files.map((file: File) => ({
                filename: file.name,
                sizeTotal: file.size,
                sizeUploaded: 0,
                status: 'queued',
                triggerUpload: signal(false)
            }))
        };
        input.click();
    }

    onItemStatusChanged(status: UploadStatus, index: number) {
        this.statusArray[index].status = status;
        this.updateStatus();
    }

    onItemSizeUploadedChanged(sizeUploaded: number, index: number) {
        this.statusArray[index].sizeUploaded = sizeUploaded;
        this.updateStatus();
    }

    updateStatus() {
        let sizeUploaded = 0;
        let sizeFailed = 0;
        let filesUploaded = 0;
        let filesFailed = 0
        for (let status of this.statusArray) {
            switch (status.status) {
                case 'uploading':
                case 'paused':
                    sizeUploaded += status.sizeUploaded;
                    break;
                case 'complete':
                    sizeUploaded += status.sizeTotal;
                    filesUploaded += 1;
                    break;
                case 'failed':
                    sizeFailed += status.sizeTotal;
                    filesFailed += 1;
                    break;
            }
        }
        if (filesUploaded + filesFailed === this.statusArray.length) {
            this.isUploading.set(false);
            this.isCompleted.set(true);
        }
        this.progressUploaded.set(sizeUploaded / this.sizeTotalQueued() * 100);
        this.progressFailed.set(sizeFailed / this.sizeTotalQueued() * 100);
    }

    onCancel() {
        this.modal.dismiss('X');
    }

    onCancelOrPause() {
        if (this.isUploading()) {
            this.pauseUploads();
        } else if (this.isCompleted()) {
            this.modal.close('Success');
        } else {
            this.modal.dismiss('Cancel');
        }
    }

    onUploadOrResume() {
        this.isUploading.set(true);
        this.dispatchUploads();
    }

    dispatchUploads() {
        const uploading = this.statusArray.filter(item => item.status === 'uploading');
        const paused = this.statusArray.filter(item => item.status === 'paused');
        const queued = this.statusArray.filter(item => item.status === 'queued');
        let available = this.config().maxConcurrentUploads! - uploading.length;
        for (let item of [...paused, ...queued]) {
            if (available > 0) {
                item.triggerUpload.set(true);
                available -= 1;
            }
        }
    }

    pauseUploads() {
        this.isUploading.set(false);
        for (let item of this.statusArray) {
            item.triggerUpload.set(false);
        }
    }

    ngOnDestroy(): void {
        this.modalConfig.backdrop = true;
    }


}





