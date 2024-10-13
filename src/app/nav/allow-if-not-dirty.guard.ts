import {inject} from "@angular/core";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {ModalConfirm} from "../modals/confirm"
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

export const allowIfNotDirtyGuard: () => Promise<boolean> = async () => {
    const dirty = inject(PhotoOrdersStore).isDirty();
    if (!dirty) return true;

    const modalRef = inject(NgbModal).open(ModalConfirm);
    modalRef.componentInstance.btnOkText.set('Egal, weiter...');
    modalRef.componentInstance.btnCancelText.set('Abbrechen');
    modalRef.componentInstance.title.set('Nicht gespeicherte Änderungen');
    modalRef.componentInstance.message.set('Änderungen verwerfen und fortfahren?');

    return new Promise<boolean>((resolve, reject) => modalRef.result
        .then(() => resolve(true))
        .catch(() => resolve(false))
    );
};