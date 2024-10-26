import {
    Component, effect, inject, input, model, OnDestroy, OnInit, output, signal, ViewChild, WritableSignal
} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../user.model"
import {FirebaseService} from "../../persistance/firebase.service";
import {removeNullishObjectKeys} from "../../shared/util";
import {Subscription} from "rxjs";
import {ModalService} from "../../modals/modal.service";
import {faUser, faUserCheck, faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'customer-detail',
    standalone: true,
    imports: [FormsModule, NgClass, FaIconComponent],
    templateUrl: './customer-detail.component.html',
    styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
    protected readonly  store = inject(PhotoOrdersStore)
    @ViewChild('form', {static: true}) form: NgForm | undefined;
    formValue = signal<User | null>(null);
    id = model('');  // Will be populated by router :id when customers/:id
    editOwnAccount = input(false, {
        transform: (value: boolean|string) => typeof value === 'string' ? true : value,
    });
    isRendered = output<boolean>();
    protected isCompany = signal(false);
    private valueChangesSubscription: Subscription | undefined;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private firebaseService: FirebaseService,
        private modalService: ModalService
        ) {
        effect(() => {
            if (!this.editOwnAccount()) {
                const selectedUser = this.store.getUser(this.id())
                if (selectedUser) {
                    setTimeout(() => this.setFormData(selectedUser));
                }
            }
        });
        effect(() => {
            if (this.editOwnAccount()) {
                const activeUser = this.store.activeUser();
                if (this.editOwnAccount() && activeUser) {
                    setTimeout(() => this.setFormData(activeUser));
                }
            }
        })
    }

    setFormData(user: User | null) {
        this.formValue.set(user);
        this.form!.resetForm(user);
        this.store.setDirty(false);
    }

    markAllTouched() {
        for (let control of Object.values(this.form!.controls)) {
            control.markAsTouched();
        }
    }

    async onSubmit(form: NgForm): Promise<void> {
        if (form.invalid) return;
        if (this.editOwnAccount()) {
            const data: User = form.value
            data.id = this.id();
            delete data.auth;
            const activeUser = await this.store.updateUser(data);
            this.store.setActiveUser(activeUser);

        } else {
            const user = removeNullishObjectKeys(form.value) as User;
            this.store.setUser(user);
        }
    };

    onCancel() {
        this.store.setDirty(false);
        this.router.navigate(['../'], {relativeTo: this.route});
    }

    async onDelete() {
        const {firstName, lastName} = this.form!.value;
        await this.modalService.confirmDeleteUser(firstName, lastName);
        this.store.removeUser(this.id());
        await this.router.navigate(['../'], {relativeTo: this.route});
    }

    onSignUpUser() {
        if (!this.formValue()) return;
        const {email, id} = this.formValue() as User;
        const subject = 'Konto erstellen'
        const origin = window.location.origin;
        const signUpLink = `${origin}/signup/${id}`
        const body =  'Hallo, %0D%0A%0D%0A' +
        `Bitte erstelle doch ein Konto, um Deine Projekte und Photos zu sehen. %0D%0A` +
        `Folge dem Link unten und richte ein Konto mit Deiner E-mail Addresse und einem sicheren Passwort ein:%0D%0A` +
        `${signUpLink} %0D%0A%0D%0A` +
        `Liebe Grüsse%0D%0A` + ''

        const linkEl = document.createElement('a');
        linkEl.href = `mailto:${email}?subject=${subject}&body=${body}`;
        linkEl.click();
    }

    ngOnInit(): void {
        this.isRendered.emit(true);
        this.valueChangesSubscription = this.form!.valueChanges?.subscribe(() => {
            if (!this.store.isDirty()) this.store.setDirty(true);
        })
    }

    ngOnDestroy(): void {
        this.isRendered.emit(false);
        this.valueChangesSubscription?.unsubscribe();
    }


    protected readonly faUser = faUser;
    protected readonly faUserCheck = faUserCheck;
    protected readonly faUserPlus = faUserPlus;
}
