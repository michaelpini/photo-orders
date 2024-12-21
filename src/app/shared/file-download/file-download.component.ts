import {Component, computed, OnDestroy, signal, WritableSignal} from '@angular/core';
import {
    NgbActiveModal,
    NgbModalConfig,
    NgbProgressbar,
    NgbProgressbarStacked,
    NgbTooltip
} from '@ng-bootstrap/ng-bootstrap';
import {FileDownloadItem} from "./file-download-item";
import {FileSizePipe} from "../file-size.pipe";
import {Photo} from "../../modals/modal.service";
import {ExtendedTaskState} from "../file-upload/file-upload.component";

export interface ModalDownloadConfig {
    title?: string;
    message?: string;
    btnUploadText?: string;
    btnResumeText?: string;
    btnCancelText?: string;
    btnPauseText?: string;
    btnCloseText?: string;
    btnClass?: string;
    path: string
    photos: Photo[];
    maxConcurrentDownloads?: number;
}
interface Status {
    filename: string;
    sizeDownloaded: number;
    sizeTotal: number;
    state: ExtendedTaskState;
    triggerDownload: WritableSignal<boolean>;
}
export interface DownloadState {
    state: ExtendedTaskState;
    error?: Error;
}

const defaultConfig: ModalDownloadConfig = {
    title: 'Dateien herunterladen',
    message: '',
    btnUploadText: 'Herunterladen',
    btnResumeText: 'Fortfahren',
    btnCancelText: 'Abbrechen',
    btnCloseText: 'Schliessen',
    btnPauseText: 'Pause',
    btnClass: 'btn-primary',
    path: '',
    photos: [],
    maxConcurrentDownloads: 3,
}

@Component({
    selector: 'file-download',
    templateUrl: './file-download.component.html',
    styleUrl: './file-download.component.scss',
    imports: [FileDownloadItem, FileSizePipe, NgbProgressbar, NgbProgressbarStacked, NgbTooltip],
})
export class FileDownloadComponent implements OnDestroy {
    config = signal<ModalDownloadConfig>(defaultConfig);
    isStarted = signal(false);
    isRunning = signal(false);
    isDone = signal(false);
    progressDownloaded = signal(0);
    progressFailed = signal(0);

    sizeTotalQueued = computed(() => {
        return this.config().photos.reduce((acc, photo) => {
            acc += photo.size;
            return acc;
        }, 0)
    })
    btnOkText = computed<string>(() => {
        if (this.isRunning()) return 'Herunterladen...';
        if (this.isStarted()) return 'Fortfahren';
        return 'Herunterladen'
    })
    btnCancelText = computed<string>(() => {
        if (this.isRunning()) return 'Pause';
        if (this.isDone()) return 'Schliessen';
        return 'Abbrechen';
    })

    statusArray: Status[] = [];

    constructor(public modal: NgbActiveModal, private modalConfig: NgbModalConfig) { }

    configure(config: ModalDownloadConfig) {
        const updatedConfig: ModalDownloadConfig = {...defaultConfig, ...config};
        this.config.set(updatedConfig);
        this.statusArray = config.photos.map((photo: Photo) => {
            return {
                filename: photo.fullName,
                sizeTotal: photo.size,
                sizeDownloaded: 0,
                state: 'queued',
                triggerDownload: signal(false)
            }
        })
    }

    onItemStatusChanged(status: ExtendedTaskState, index: number) {
        this.statusArray[index].state = status;
        if (status === 'success') {
            this.statusArray[index].sizeDownloaded = this.statusArray[index].sizeTotal;
        }
        this.updateStatus();
    }

    updateStatus() {
        let sizeDownloaded = 0;
        let sizeFailed = 0;
        let filesUploaded = 0;
        let filesFailed = 0
        for (let status of this.statusArray) {
            switch (status.state) {
                case 'running':
                    sizeDownloaded += status.sizeDownloaded;
                    break;
                case 'success':
                    sizeDownloaded += status.sizeTotal;
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
        this.progressDownloaded.set(sizeDownloaded / this.sizeTotalQueued() * 100);
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

    onDownloadOrResume() {
        this.isStarted.set(true);
        this.isRunning.set(true);
        this.dispatchDownloads();
    }

    dispatchDownloads() {
        const running = this.statusArray.filter(item => item.state === 'running');
        const queued = this.statusArray.filter(item => item.state === 'queued');
        let available = this.config().maxConcurrentDownloads! - running.length;
        for (let item of queued) {
            if (available > 0) {
                item.triggerDownload.set(true);
                available -= 1;
            }
        }
    }

    pauseUploads() {
        this.isRunning.set(false);
    }

    onDone() {
        if (this.isRunning()) {
            this.dispatchDownloads();
        }
    }

    ngOnDestroy(): void {
        this.modalConfig.backdrop = true;
    }

}





