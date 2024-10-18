import {Component, inject, OnDestroy} from '@angular/core';
import {ToastService} from './toast.service';
import {ToastsContainer} from './toasts-container.component';
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {pipe, tap} from "rxjs";

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
        rxMethod<string | null>(pipe(
            tap(error => {
                setTimeout(() => {
                    if (error) this.toastService.showError('Error occurred');
                }, 20)
                // if (error) this.toastService.showError('Error occurred');
            })
        ))(this.store.error);
    }

    ngOnDestroy(): void {
        this.toastService.clear();
    }

}
