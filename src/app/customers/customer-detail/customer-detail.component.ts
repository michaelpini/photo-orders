import {
    Component,
    computed,
    effect,
    inject,
    input,
    OnDestroy,
    OnInit,
    output,
    Signal,
    signal,
    ViewChild
} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../user.model"
import {FirebaseService} from "../../persistance/firebase.service";
import {removeNullishObjectKeys} from "../../shared/util";

@Component({
    selector: 'customer-detail',
    standalone: true,
    imports: [FormsModule, NgClass],
    templateUrl: './customer-detail.component.html',
    styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
    @ViewChild('form', {static: true}) form!: NgForm;
    store = inject(PhotoOrdersStore)
    isCompany = signal(false);
    id = input<string>();
    isRendered = output<boolean>();


    constructor(private router: Router ,private route: ActivatedRoute, private firebaseService: FirebaseService) {
        effect(() => {
            const id = this.id() || '';
            const userMap = this.store.usersEntityMap();
            const selectedUser = userMap[id];
            console.log('Selected User', selectedUser)
            setTimeout(() => this.setFormData(selectedUser));
        });
    }

    setFormData(user: User | null) {
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

    async onSubmit(form: NgForm): Promise<void> {
        if (form.invalid) return;
        const data = removeNullishObjectKeys(form.value) as User;
        this.firebaseService.setUser(data).then((user: User) => {
            this.store.setUser(user);
            alert('Gespeichert')
        });
    };

    onCancel() {
        this.router.navigate(['../'], {relativeTo : this.route});
    }

    ngOnInit(): void {
        this.isRendered.emit(true);
        // this.store.setSelectedUserId(this.id() || '')
    }

    ngOnDestroy(): void {
        this.isRendered.emit(false);
    }


}
