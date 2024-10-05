import {Component, effect, model, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";

@Component({
    selector: 'customer-detail',
    standalone: true,
    imports: [
        FormsModule,
        NgClass
    ],
    templateUrl: './customer-detail.component.html',
    styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent {
    @ViewChild('form') form!: NgForm;
    validate() {
        for (let control of Object.values(this.form.controls)) {
            control.markAsTouched();
        }
    }
    isBusiness = model(false);

    constructor() {
        effect(() => {
            // alert(this.isBusiness())
        });
    }

    onSubmit(form: NgForm): void {
        if (form.invalid) return;

    };


}
