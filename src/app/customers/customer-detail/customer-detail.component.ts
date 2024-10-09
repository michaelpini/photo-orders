import {Component, inject, model, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import {PhotoStore} from "../../store/photoStore";
import {ActivatedRoute} from "@angular/router";
import {User} from "../customer.model"
import {FirebaseService} from "../../persistance/firebase.service";
import {cleanObject} from "../../shared/util";


@Component({
    selector: 'customer-detail',
    standalone: true,
    imports: [FormsModule, NgClass],
    templateUrl: './customer-detail.component.html',
    styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
    @ViewChild('form', {static: true}) form!: NgForm;
    store = inject(PhotoStore)
    isCompany = signal(false);

    constructor(private route: ActivatedRoute, private firebaseService: FirebaseService) {
    }

    setFormData(user: User) {
        if(user) {
            this.form.resetForm(user)
        } else {
            this.form.resetForm();
        }
    }

    validate() {
        for (let control of Object.values(this.form.controls)) {
            control.markAsTouched();
        }
    }

    onSubmit(form: NgForm): void {
        if (form.invalid) return;
        const data = cleanObject(form.value);
        this.firebaseService.setUser(data).then(() => alert('Gespeichert'));


    };

    ngOnInit(): void {
        setTimeout(() => {
            const url = this.route.snapshot.url;
            const id = url[url.length - 1].path;
            const user = this.store.usersEntityMap()[id];
            this.setFormData(user);

            this.route.url.subscribe(url => {
                const id = url[url.length - 1].path;
                const user = this.store.usersEntityMap()[id];
                this.setFormData(user);
            })
        })
    }


}
