import {inject, Injectable} from "@angular/core";
import {ModalConfirm, ModalConfirmConfig} from "./confirm/confirm";
import {NgbModal, NgbModalConfig} from "@ng-bootstrap/ng-bootstrap";
import {SignInComponent} from "./auth/sign-in.component";
import {SignUpComponent} from "./auth/sign-up.component";
import {ChangePwComponent} from "./auth/change-pw.component";
import {ChangeEmailComponent} from "./auth/change-email.component";
import {FileUploadComponent, FileUploadSuccess, ModalUploadConfig} from "../shared/file-upload/file-upload.component";
import {getImageMeta, ImageFileMetaData} from "../shared/util";
import {PhotoOrdersStore} from "../store/photoOrdersStore";

export interface Photo extends ImageFileMetaData {id: string, downloadUrl: string, liked?: boolean, tag?: string}

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
        }
        return this.confirm(config);
    }

    confirmDeleteUser(firstName: string, lastName: string): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'User Löschen?',
            html: `<div>User ${firstName || ''} ${lastName || ''} wirklich löschen?<br> Dies kann nicht rückgängig gemacht werden!</div>`,
            btnOkText: 'Löschen',
            btnClass: 'btn-danger',
        }
        return this.confirm(config);
    }

    confirmDeleteProject(name: string): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'Projekt Löschen?',
            html: `<div>Projekt ${name || ''} wirklich löschen?<br> Dies kann nicht rückgängig gemacht werden!</div>`,
            btnOkText: 'Löschen',
            btnClass: 'btn-danger',
        }
        return this.confirm(config);
    }

    confirmSendEmailVerification(email: string): Promise<string> {
        const config: ModalConfirmConfig = {
            title: 'Email Bestätigung',
            html: `<p>Zur Überprüfung der E-mail Addresse wird ein Mail mit einem Bestätigungslink an ${email} geschickt.</p>
                   <p>Bitte im e-mail den Bestätigungs-Link klicken.</p>`,
            btnOkText: 'Weiter',
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

    // File Upload
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
            message: 'Es können Photos bis zu 10MB hochgeladen werden (jpg, png, webp)',
        }
        this.modalConfig.backdrop = 'static';
        const modalRef = this.ngbModal.open(FileUploadComponent);
        modalRef.componentInstance.fileUploaded.subscribe(async (p: FileUploadSuccess) => {
            const imageMeta = await getImageMeta(p.file)
            const photo: Photo = {...imageMeta, id: imageMeta.fullName, downloadUrl: p.state.downloadUrl || ''};
            this.store.addPhoto(projectId, photo);
        });
        modalRef.componentInstance.configure(config);
        return modalRef.result;
    }
}
