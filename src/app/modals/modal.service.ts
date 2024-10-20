import {inject, Injectable} from "@angular/core";
import {ModalConfirm, ModalConfirmConfig} from "./confirm/confirm";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SignInComponent} from "./auth/sign-in.component";
import {SignUpComponent} from "./auth/sign-up.component";
import {ChangePwComponent} from "./auth/change-pw.component";

@Injectable({providedIn: "root"})
export class ModalService {
    protected ngbModal = inject(NgbModal);

    confirmDeleteUser(firstName: string, lastName: string): Promise<void> {
        const config: ModalConfirmConfig = {
            title: 'User Löschen?',
            html: `<div>User ${firstName || ''} ${lastName || ''} wirklich löschen?<br> Dies kann nicht rückgängig gemacht werden!</div>`,
            btnOkText: 'Löschen',
            btnClass: 'btn-danger',
        }
        return this.confirm(config);
    }

    discardChanges(): Promise<void> {
        const config: ModalConfirmConfig = {
            title: 'Nicht gespeicherte Änderung',
            html: `<div>Es gibt nicht gespeicherte Änderungen<br>Änderungen verwerfen und weiterfahren?</div>`,
            btnOkText: 'Weiter',
        }
        return this.confirm(config);
    }

    confirm(config: ModalConfirmConfig = {message: 'Weiter?'}) {
        const modalRef = this.ngbModal.open(ModalConfirm);
        modalRef.componentInstance.configure(config);
        return modalRef.result;
    }

    signIn(): Promise<void> {
        const modalRef = this.ngbModal.open(SignInComponent);
        return modalRef.result;
    }

    signUp(): Promise<void> {
        const modalRef = this.ngbModal.open(SignUpComponent);
        return modalRef.result;
    }

    changePassword() {
        const modalRef = this.ngbModal.open(ChangePwComponent);
        return modalRef.result;
    }

    changeEmail() {
        return
        // const modalRef = this.ngbModal.open(ChangeEmailComponent);
        // return modalRef.result;
    }

}
