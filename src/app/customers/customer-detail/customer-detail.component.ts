import {
    Component, effect, inject, input, model, OnDestroy, OnInit, output, signal, ViewChild, WritableSignal
} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {NgClass} from "@angular/common";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../user.model"
import {removeNullishObjectKeys} from "../../shared/util";
import {debounceTime, map, Subscription, take} from "rxjs";
import {ModalService} from "../../modals/modal.service";
import {faUser, faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {AuthType, AuthUser} from "../../auth/authUser.model";
import {FirebaseService} from "../../persistance/firebase.service";
import {firebaseAuth} from "../../../main";
import {ToastService} from "../../shared/toasts/toast.service";

@Component({
    selector: 'customer-detail',
    standalone: true,
    imports: [FormsModule, NgClass, FaIconComponent, NgbTooltip],
    templateUrl: './customer-detail.component.html',
    styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
    protected readonly store = inject(PhotoOrdersStore);
    protected readonly faUser = faUser;
    protected readonly faUserPlus = faUserPlus;
    private valueChangesSubscription: Subscription | undefined;
    private formInitializing = false;

    @ViewChild('form', {static: true}) form: NgForm | undefined;
    authUser = signal<AuthUser | null>(null);
    data = signal<User | null>(null);
    id = model('');  // Will be populated by router :id when customers/:id
    editOwnAccount = input(false, {
        transform: (value: boolean|string) => typeof value === 'string' ? true : value,
    });
    isRendered = output<boolean>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modalService: ModalService,
        private firebaseService: FirebaseService,
        private toastService: ToastService,
        ) {
        effect(async () => {
            if (!this.editOwnAccount()) {
                const selectedUser = this.store.getUser(this.id())
                if (selectedUser) {
                    setTimeout(() => this.setFormData(selectedUser));
                }
                const authUsers = await this.firebaseService.queryAuthUserByUserId(this.id());
                this.authUser.set(authUsers?.[0] || null);
            }
        });
        effect(() => {
            if (this.editOwnAccount()) {
                const activeUser = this.store.activeUser();
                if (activeUser) {
                    setTimeout(() => {
                        const authUser: AuthUser = this.store.authUser()!;
                        authUser.emailVerified = firebaseAuth.currentUser?.emailVerified || false;
                        this.authUser.set(authUser);
                        this.setFormData(activeUser);
                    });
                }
            }
        })
    }

    setFormData(user: User | null) {
        this.formInitializing = true;
        this.data.set(user);
        this.form!.resetForm(user);
        this.store.setDirty(false);
        this.formInitializing = false;
    }

    markAllTouched() {
        for (let control of Object.values(this.form!.controls)) {
            control.markAsTouched();
        }
    }

    async onSave(form: NgForm): Promise<void> {
        if (form.invalid || this.data() === null) return;
        if (this.editOwnAccount()) {
            const data: User = this.data() as User;
            data.id = this.id();
            const activeUser = await this.store.updateUser(data);
            this.store.setActiveUser(activeUser);
        } else {
            const data: User = this.data() as User;
            this.store.setUser(data);
        }
        this.store.setDirty(false);
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

    onSignUpUser(el: HTMLButtonElement) {
        el.blur();
        if (!this.data()) return;
        const {email, id} = this.data() as User;
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

    async authChanged(authType: string) {
        this.authUser.update(value => ({...value, authType} as AuthUser));
        try {
            this.store.setBusy();
            await this.firebaseService.updateAuthUser(this.authUser()!);
            this.toastService.showSuccess('Auth Berechtigung geändert');
            this.store.setIdle();
        } catch (error) {
            this.store.setError('Fehler beim Ändern der Auth Berechtigung');
        }
    }

    ngOnInit(): void {
        this.formInitializing = true;
        this.isRendered.emit(true);
        this.valueChangesSubscription = this.form!.valueChanges?.
        subscribe((value) => {
            if (this.formInitializing) return;
            this.data.update(currentVal => ({...currentVal, ...value}));
            this.store.setDirty(true);
        })
    }

    ngOnDestroy(): void {
        this.isRendered.emit(false);
        this.valueChangesSubscription?.unsubscribe();
    }


}
