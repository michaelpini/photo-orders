import {Component, computed, signal} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {SafeHtmlPipe} from "../../shared/safeHtml.pipe";

export type ModalIcons = '' | 'warning' | 'danger' | 'info' | 'question' | 'success';

export type ModalConfirmConfig = {
    title?: string;
    message?: string;
    html?: string;
    btnOkText?: string;
    btnCancelText?: string;
    btnClass?: string;
    icon?: ModalIcons;
}

const defaultConfig: ModalConfirmConfig = {
    title: '',
    message: '',
    html: '',
    btnOkText: 'Ok',
    btnCancelText: 'Abbrechen',
    btnClass: 'btn-primary',
    icon: '',
}

@Component({
    selector: 'modal-confirm',
    templateUrl: './confirm.html',
    styles: `.modal-body {
        white-space: pre-line;
    }
    .icon {
        height: 40px;
        width: 40px;
        margin-right: 0.5rem;
    }`,
    imports: [SafeHtmlPipe]
})
export class ModalConfirm {
    config = signal<ModalConfirmConfig>(defaultConfig);
    iconId = computed(() => {
        return '#' + this.config()?.icon;
    })

    configure(config: ModalConfirmConfig) {
        const updatedConfig = {...defaultConfig, ...config};
        this.config.set(updatedConfig);
    }

    constructor(public modal: NgbActiveModal) { }

}
