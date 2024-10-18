import { Injectable, TemplateRef } from '@angular/core';

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
    toasts: Toast[] = [];

    show(toast: Toast) {
        this.toasts.push(toast);
    }

    showNormal(param: Toast | string) {
        const toastTemplate: Toast = { delay: 5000 };
        this.toasts.push(this.getToast(param, toastTemplate));
    }

    showError(param: Toast | string) {
        const toastTemplate: Toast = { classname: 'bg-danger text-light', icon: 'error', delay: 10000 };
        this.toasts.push(this.getToast(param, toastTemplate));
    }

    showSuccess(param: Toast | string) {
        const toastTemplate: Toast = { classname: 'bg-success text-light', icon: 'success', delay: 5000 };
        this.toasts.push(this.getToast(param, toastTemplate));
    }

    remove(toast: Toast) {
        this.toasts = this.toasts.filter((t) => t !== toast);
    }

    clear() {
        this.toasts.splice(0, this.toasts.length);
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
