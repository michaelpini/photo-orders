import {Component, signal} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {SafeHtmlPipe} from "../shared/safeHtml.pipe";

@Component({
    selector: 'modal-confirm',
    standalone: true,
    templateUrl: './confirm.html',
    imports: [
        SafeHtmlPipe
    ]
})
export class ModalConfirm {
    btnOkText = signal('Ok');
    btnCancelText = signal('Abbrechen');
    title = signal('Änderungen speichern?');
    message = signal('Änderungen verwerfen und fortfahren?');
    /**
     * CAUTION: Do not use with user generated content (bypasses security)
     */
    html = signal('');

    constructor(public modal: NgbActiveModal) { }
}
