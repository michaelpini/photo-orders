import {Component, computed, OnDestroy, output, signal, WritableSignal} from '@angular/core';
import {NgbActiveModal, NgbModalConfig, NgbProgressbar, NgbProgressbarStacked} from '@ng-bootstrap/ng-bootstrap';
import {FileUploadItem} from "./file-upload-item";
import {TaskState, UploadMetadata} from "firebase/storage";
import {FileSizePipe} from "../file-size.pipe";
import {UploadState} from "../../persistance/firebase.service";

export type ExtendedTaskState = 'queued' | TaskState
export interface ModalUploadConfig {
    title?: string;
    message?: string;
    btnUploadText?: string;
    btnResumeText?: string;
    btnCancelText?: string;
    btnPauseText?: string;
    btnCloseText?: string;
    btnClass?: string;
    path: string
    metadata: UploadMetadata
    maxConcurrentUploads?: number;
    multiple?: boolean;
    accept?: string;
}
interface Status {
    filename: string;
    sizeUploaded: number;
    sizeTotal: number;
    state: ExtendedTaskState;
    triggerUpload: WritableSignal<boolean>;
}

export interface FileUploadSuccess {
    file: File;
    state: UploadState;
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
    metadata: {customMetadata: {userId: ''}},
    maxConcurrentUploads: 3,
    multiple: true,
    accept: 'image/*',
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
    isStarted = signal(false);
    isRunning = signal(false);
    isDone = signal(false);
    progressUploaded = signal(0);
    progressFailed = signal(0);

    sizeTotalQueued = computed(() => {
        return this.uploadFiles().reduce((acc, file) => {
            acc += file.size;
            return acc;
        }, 0)
    })
    btnOkText = computed<string>(() => {
        if (this.isRunning()) return 'Hochladen...';
        if (this.isStarted()) return 'Fortfahren';
        return 'Hochladen'
    })
    btnCancelText = computed<string>(() => {
        if (this.isRunning()) return 'Pause';
        if (this.isDone()) return 'Schliessen';
        return 'Abbrechen';
    })

    fileUploaded = output<FileUploadSuccess>();

    statusArray: Status[] = [];

    constructor(public modal: NgbActiveModal, private modalConfig: NgbModalConfig) { }

    configure(config: ModalUploadConfig) {
        const updatedConfig = {...defaultConfig, ...config};
        this.config.set(updatedConfig);
    }

    selectFiles() {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = this.config().accept || 'image/*';
        input.multiple = this.config().multiple || false;
        input.onchange = _ => {
            let files: File[] = Array.from(input.files || []);
            this.uploadFiles.set(files);
            this.statusArray = files.map((file: File) => {
                return {
                    filename: file.name,
                    sizeTotal: file.size,
                    sizeUploaded: 0,
                    state: 'queued',
                    triggerUpload: signal(false)
                }
            })
        };
        input.click();
    }

    onItemStatusChanged(status: ExtendedTaskState, index: number) {
        this.statusArray[index].state = status;
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
            switch (status.state) {
                case 'running':
                case 'paused':
                    sizeUploaded += status.sizeUploaded;
                    break;
                case 'success':
                    sizeUploaded += status.sizeTotal;
                    filesUploaded += 1;
                    break;
                case 'error':
                    sizeFailed += status.sizeTotal;
                    filesFailed += 1;
                    break;
            }
        }
        if (filesUploaded + filesFailed === this.statusArray.length) {
            this.isRunning.set(false);
            this.isDone.set(true);
        }
        this.progressUploaded.set(sizeUploaded / this.sizeTotalQueued() * 100);
        this.progressFailed.set(sizeFailed / this.sizeTotalQueued() * 100);
    }

    onCancel() {
        this.modal.dismiss('X');
    }

    onCancelOrPause() {
        if (this.isRunning()) {
            this.pauseUploads();
        } else {
            this.modal.dismiss('Cancel');
        }
    }

    onClose() {
        this.modal.dismiss('Success');
    }

    onUploadOrResume() {
        this.isStarted.set(true);
        this.isRunning.set(true);
        this.dispatchUploads();
    }

    dispatchUploads() {
        const running = this.statusArray.filter(item => item.state === 'running');
        const paused = this.statusArray.filter(item => item.state === 'paused');
        const queued = this.statusArray.filter(item => item.state === 'queued');
        let available = this.config().maxConcurrentUploads! - running.length;
        for (let item of [...paused, ...queued]) {
            if (available > 0) {
                item.triggerUpload.set(true);
                available -= 1;
            }
        }
    }

    pauseUploads() {
        this.isRunning.set(false);
        for (let item of this.statusArray) {
            item.triggerUpload.set(false);
        }
    }

    onSuccess(state: UploadState, index: number) {
        this.dispatchUploads();
        this.fileUploaded.emit({file: this.uploadFiles()[index], state});
    }

    ngOnDestroy(): void {
        this.modalConfig.backdrop = true;
    }


}





