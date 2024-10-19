import {Component, effect, inject, OnDestroy} from '@angular/core';
import {ToastService} from './toast.service';
import {ToastsContainer} from './toasts-container.component';
import {PhotoOrdersStore} from "../../store/photoOrdersStore";

@Component({
    selector: 'ngbd-toast-global',
    standalone: true,
    imports: [ToastsContainer],
    template: `
        <app-toasts aria-live="polite" aria-atomic="true"></app-toasts>`
})
export class NgbdToastGlobal implements OnDestroy {
    toastService = inject(ToastService);
    store = inject(PhotoOrdersStore);

    constructor() {
        effect(() => {
            const error = this.store.error();
            if (error) setTimeout(() => this.toastService.showError(error));
        })
    }

    ngOnDestroy(): void {
        this.toastService.clear();
    }

}
