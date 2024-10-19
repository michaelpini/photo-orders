import { Injectable, TemplateRef } from '@angular/core';
import {signal} from "@angular/core";

export interface Toast {
    header?: string;
    template?: TemplateRef<any>;
    message?: string;
    classname?: string;
    delay?: number;
    icon?: 'error' | 'warning' | 'success' | 'info' ;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(toast: Toast) {
        this.toasts.update(toasts => ([...toasts, toast]));
    }

    showNormal(param: Toast | string) {
        const toastTemplate: Toast = { delay: 5000 };
        const toast = this.getToast(param, toastTemplate);
        this.toasts.update(toasts => ([...toasts, toast]));
    }

    showError(param: Toast | string) {
        const toastTemplate: Toast = { classname: 'bg-danger text-light', icon: 'error', delay: 10000 };
        const toast = this.getToast(param, toastTemplate);
        this.toasts.update(toasts => ([...toasts, toast]));
    }

    showSuccess(param: Toast | string) {
        const toastTemplate: Toast = { classname: 'bg-success text-light', icon: 'success', delay: 5000 };
        const toast = this.getToast(param, toastTemplate);
        this.toasts.update(toasts => ([...toasts, toast]));
    }

    remove(toast: Toast) {
        const toasts = this.toasts().filter((t) => t !== toast);
        this.toasts.set(toasts);
    }

    clear() {
        this.toasts.set([]);
    }

    private getToast(param: Toast | string, toastTemplate: Toast) {
        let toast: Toast = { ...toastTemplate };
        if (typeof param === 'string') {
            toast.message = param;
        } else {
            Object.assign(toast, param);
        }
        return toast;
    }
}
