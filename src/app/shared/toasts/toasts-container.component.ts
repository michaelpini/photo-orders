import {Component, inject} from "@angular/core";
import {NgbToastModule} from "@ng-bootstrap/ng-bootstrap";
import {NgTemplateOutlet} from "@angular/common";
import {ToastService} from "./toast.service";

@Component({
    selector: 'app-toasts',
    standalone: true,
    imports: [NgbToastModule, NgTemplateOutlet],
    template: `
        <div class="toast-container position-fixed bottom-center p-3">
            @for (toast of toastService.toasts(); track toast) {
                <ngb-toast
                        [header]="toast.header ||''"
                        [class]="toast.classname"
                        [autohide]="toast.autohide === undefined ? true : toast.autohide"
                        [delay]="toast.delay || 5000"
                        (hidden)="toastService.remove(toast)"
                                        >
                    <div class="toast-box">
                        @if (toast.message) {
                            @if (toast.icon) {
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" class="me-2">
                                    @switch (toast.icon) {
                                        @case ('error') {
                                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm0-160q17 0 28.5-11.5T520-480v-160q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v160q0 17 11.5 28.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                                        }
                                        @case ('warning') {
                                            <path d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T885-140q-5 9-14 14.5t-20 5.5H109Zm69-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm0-120q17 0 28.5-11.5T520-400v-120q0-17-11.5-28.5T480-560q-17 0-28.5 11.5T440-520v120q0 17 11.5 28.5T480-360Zm0-100Z"/>
                                        }
                                        @case ('success') {
                                            <path d="m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z"/>
                                        }
                                        @case ('info') {
                                            <path d="M480-280q17 0 28.5-11.5T520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280Zm0-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                                        }
                                    }
                                </svg>
                            }
                            <div class="toast-message">{{ toast.message }}</div>
                        }
                        @if (toast.template) {
                            <ng-template [ngTemplateOutlet]="toast.template"></ng-template>
                        }
                    </div>
                    
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" class="toast-close" (click)="toastService.remove(toast)">
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                    </svg>
                    
                </ngb-toast>
            }
        </div>
    `,
    styles: `
        .bottom-center { 
            bottom: 0; 
            left: 50%; 
            transform: translateX(-50%); 
            z-index: 1200; 
        }
        .toast-message {
            white-space: pre-line;
        }
        .toast-close {
            position: absolute;
            top: 0;
            right: 0;
            border-left: 1px solid silver;
            border-bottom: 1px solid silver;
            border-bottom-left-radius: 5px;
            cursor: pointer;
            opacity: 20%;
        }
        ngb-toast {
            position: relative;
        }
        .toast-box {
            display: flex;
        }
        ngb-toast:hover .toast-close {
            opacity: 100%
        }
        .toast-close:hover {
            transform: scale(1.1);
        }
    `,
})
export class ToastsContainer {
    toastService = inject(ToastService);
}
