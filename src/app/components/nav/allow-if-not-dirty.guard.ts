import {inject} from "@angular/core";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ModalService} from "../../modals/modal.service";
import {safeAwait} from "../../shared/util";

export const allowIfNotDirtyGuard: () => Promise<boolean> = async () => {
    const store = inject(PhotoOrdersStore);
    const modalService = inject(ModalService)

    if (!store.isDirty()) return true;

    const [error, success] = await safeAwait(modalService.confirmDiscardChanges());
    if (error) return false;
    store.setDirty(false);
    return true;
};
