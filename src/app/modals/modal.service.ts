import {inject, Injectable} from "@angular/core";
import {ModalConfirm, ModalConfirmConfig, ModalIcons} from "./confirm/confirm";
import {NgbModal, NgbModalConfig} from "@ng-bootstrap/ng-bootstrap";
import {SignInComponent} from "./auth/sign-in.component";
import {SignUpComponent} from "./auth/sign-up.component";
import {ChangePwComponent} from "./auth/change-pw.component";
import {ChangeEmailComponent} from "./auth/change-email.component";
import {FileUploadComponent, FileUploadSuccess, ModalUploadConfig} from "../shared/file-upload/file-upload.component";
import {getImageMeta, getRandomId} from "../shared/util";
import {Photo, PhotoExtended, PhotoOrdersStore} from "../store/photoOrdersStore";
import {FileDownloadComponent, ModalDownloadConfig} from "../shared/file-download/file-download.component";

export declare interface ModalConfigure<T> {
    configure(config: T): void;
}

@Injectable({providedIn: "root"})
export class ModalService {
    protected ngbModal = inject(NgbModal);
    protected modalConfig: NgbModalConfig = inject(NgbModalConfig);
    protected store = inject(PhotoOrdersStore);

    // Confirmation dialogs
    confirm(config: ModalConfirmConfig = {message: 'Weiter?'}): Promise<string> {
        const modalRef = this.ngbModal.open(ModalConfirm);
        modalRef.componentInstance.configure(config);
        return modalRef.result;
    }

    confirmDiscardChanges(): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'Nicht gespeicherte Änderung',
            html: `<div>Es gibt nicht gespeicherte Änderungen<br>Änderungen verwerfen und weiterfahren?</div>`,
            btnOkText: 'Weiter',
            icon: "warning",
        }
        return this.confirm(config);
    }

    confirmDeleteUser(firstName: string, lastName: string): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'User Löschen?',
            html: `<div>User ${firstName || ''} ${lastName || ''} wirklich löschen?<br> Dies kann nicht rückgängig gemacht werden!</div>`,
            btnOkText: 'Löschen',
            btnClass: 'btn-danger',
            icon: 'danger',
        }
        return this.confirm(config);
    }

    confirmDeleteProject(name: string): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'Projekt Löschen?',
            html: `<div>Projekt ${name || ''} wirklich löschen?<br> Dies kann nicht rückgängig gemacht werden!</div>`,
            btnOkText: 'Löschen',
            btnClass: 'btn-danger',
            icon: 'danger',
        }
        return this.confirm(config);
    }

    confirmSendEmailVerification(email: string): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'Email Bestätigung',
            html: `<p>Zur Überprüfung der E-mail Addresse wird ein Mail mit einem Bestätigungslink an ${email} geschickt.</p>
                   <p>Bitte im e-mail den Bestätigungs-Link klicken.</p>`,
            btnOkText: 'Weiter',
            icon: 'question',
        }
        return this.confirm(config);
    }

    confirmDeletePhotos(photos: PhotoExtended[]) {
        const count = photos.length;
        const txt = count === 1 ? photos[0].fullName : `${count} Fotos`;
        const config: ModalConfirmConfig = {
            title: count === 1 ? '1 Foto löschen?' : `${count} Fotos löschen?`,
            html: `<div>${txt} wirklich löschen?<br> Dies kann nicht rückgängig gemacht werden!</div>`,
            btnOkText: 'Löschen',
            btnClass: 'btn-danger',
        }
        return this.confirm(config);
    }

    info(message: string, title = 'Info', icon: ModalIcons = '') {
        const config: ModalConfirmConfig = {
            title,
            message,
            btnOkText: 'Schliessen',
            btnCancelText: '',
            icon,
        }
        return this.confirm(config);
    }

    // Auth
    signIn(): Promise<void> {
        const modalRef = this.ngbModal.open(SignInComponent);
        return modalRef.result;
    }

    signUp(userId: string): Promise<void> {
        const modalRef = this.ngbModal.open(SignUpComponent);
        modalRef.componentInstance.userId = userId;
        return modalRef.result;
    }

    changePassword(): Promise<void> {
        const modalRef = this.ngbModal.open(ChangePwComponent);
        return modalRef.result;
    }

    changeEmail(): Promise<void> {
        const modalRef = this.ngbModal.open(ChangeEmailComponent);
        return modalRef.result;
    }

    // Photos
    uploadPhotos(projectId: string, userId: string) {
        const config: ModalUploadConfig = {
            path: `images/projects/${projectId}/`,
            metadata: {
                customMetadata: {
                    userId,
                    projectId,
                    resolution: 'full'}
            },
            title: 'Photos hochladen',
            message: '👉 Nur Bilder bis max. 15MB   (JPG, WEBP, AVIF, PNG)',
            accept: 'image/jpeg, image/webp, image/avif, image/png',
            acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
            multiple: true,
            maxBytes: 15*1024*1024,
        }
        this.modalConfig.backdrop = 'static';
        const modalRef = this.ngbModal.open(FileUploadComponent);
        modalRef.componentInstance.fileUploaded.subscribe(async (p: FileUploadSuccess) => {
            const imageMeta = await getImageMeta(p.file);
            const id = imageMeta.fullName;
            const guid = getRandomId();
            const downloadUrl = p.state.downloadUrl || ''
            const photo: Photo = {...imageMeta, id, downloadUrl, guid};
            this.store.addPhoto(projectId, photo);
        });
        modalRef.componentInstance.configure(config);
        return modalRef.result;
    }

    downloadPhotos(projectId: string, photos: Photo[]) {
        const config: ModalDownloadConfig = {
            path: `images/projects/${projectId}/`,
            photos,
            title: 'Photos herunterladen',
        }
        this.modalConfig.backdrop = 'static';
        const modalRef = this.ngbModal.open(FileDownloadComponent);
        modalRef.componentInstance.configure(config);
        return modalRef.result;
    }

}
