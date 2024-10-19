import {
    Component, effect, inject, input, OnDestroy, OnInit, output, signal, ViewChild
} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../user.model"
import {FirebaseService} from "../../persistance/firebase.service";
import {removeNullishObjectKeys} from "../../shared/util";
import {Subscription} from "rxjs";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalConfirm} from "../../modals/confirm";

@Component({
    selector: 'customer-detail',
    standalone: true,
    imports: [FormsModule, NgClass],
    templateUrl: './customer-detail.component.html',
    styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
    @ViewChild('form', {static: true}) form!: NgForm;
    protected readonly  store = inject(PhotoOrdersStore)
    protected ngbModal = inject(NgbModal);
    id = input<string>();  // Can be populated by router :id
    isCompany = signal(false);
    isRendered = output<boolean>();
    valueChangesSubscription: Subscription | undefined;

    constructor(private router: Router, private route: ActivatedRoute, private firebaseService: FirebaseService) {
        effect(() => {
            const selectedUser = this.store.getUser(this.id())
            setTimeout(() => this.setFormData(selectedUser));
        });
    }

    setFormData(user: User | null) {
        this.form.resetForm(user);
        this.store.setDirty(false);
    }

    validate() {
        for (let control of Object.values(this.form.controls)) {
            control.markAsTouched();
        }
    }

    async onSubmit(form: NgForm): Promise<void> {
        if (form.invalid) return;
        const user = removeNullishObjectKeys(form.value) as User;
        this.store.setUser(user);
    };

    onCancel() {
        this.store.setDirty(false);
        this.router.navigate(['../'], {relativeTo: this.route});
    }

    async onDelete() {
        const {firstName, lastName} = this.form.value;
        const modalRef = this.ngbModal.open(ModalConfirm);
        modalRef.componentInstance.btnOkText.set('Löschen');
        modalRef.componentInstance.btnCancelText.set('Abbrechen');
        modalRef.componentInstance.title.set('User Löschen?');
        modalRef.componentInstance.message.set('');
        modalRef.componentInstance.html.set(`<p>User ${firstName} ${lastName} wirklich löschen?</p><p>Dies kann nicht rückgängig gemacht werden!</p>`);
        modalRef.componentInstance.btnClass.set('btn-danger');
        await modalRef.result;
        this.store.removeUser(this.id());
        await this.router.navigate(['../'], {relativeTo: this.route});
    }

    ngOnInit(): void {
        this.isRendered.emit(true);
        this.valueChangesSubscription = this.form.valueChanges?.subscribe(() => {
            if (!this.store.isDirty()) this.store.setDirty(true);
        })

    }

    ngOnDestroy(): void {
        this.isRendered.emit(false);
        this.valueChangesSubscription?.unsubscribe();
    }


}
