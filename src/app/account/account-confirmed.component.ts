import {Component, inject, OnInit} from "@angular/core";
import {firebaseAuth} from "../../main";
import {PhotoOrdersStore} from "../store/photoOrdersStore";

@Component({
    selector: 'app-account-confirmed',
    template: `<div class="">Konto verifiziert</div>`,
    standalone: true,

})
export class AccountConfirmedComponent implements OnInit {
    protected store = inject(PhotoOrdersStore);
    ngOnInit(): void {
        const {emailVerified} = firebaseAuth.currentUser!;
        const {id} = this.store.activeUser()!;
        this.store.updateUser({id, emailVerified})
    }

}
