import {Component, signal} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {SafeHtmlPipe} from "../../shared/safeHtml.pipe";

export type ModalConfirmConfig = {
    title?: string;
    message?: string;
    html?: string;
    btnOkText?: string;
    btnCancelText?: string;
    btnClass?: string;
}

const defaultConfig: ModalConfirmConfig = {
    title: '',
    message: '',
    html: '',
    btnOkText: 'Ok',
    btnCancelText: 'Abbrechen',
    btnClass: 'btn-primary',
}

@Component({
    selector: 'modal-confirm',
    standalone: true,
    templateUrl: './confirm.html',
    imports: [SafeHtmlPipe]
})
export class ModalConfirm {
    config = signal<ModalConfirmConfig>(defaultConfig);

    configure(config: ModalConfirmConfig) {
        const updatedConfig = {...defaultConfig, ...config};
        this.config.set(updatedConfig);
    }

    constructor(public modal: NgbActiveModal) { }

}
