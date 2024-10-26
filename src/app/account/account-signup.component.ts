import {AfterViewInit, Component, computed, input} from "@angular/core";
import {FirebaseService} from "../persistance/firebase.service";
import {AuthService} from "../auth/auth.service";
import {ModalService} from "../modals/modal.service";

@Component({
    selector: "app",
    template: `
        <h1>Konto Erstellen</h1>
        @if(maybeValid()) {
            <p>Für Kunden Id: {{id()}}</p>
        } @else {
            <h4 class="text-danger">Ungültige ID!</h4>
        }
    `,
    standalone: true,
})
export class AccountSignupComponent implements AfterViewInit {
    id = input('');
    maybeValid = computed<boolean>(() => this.id().length >= 20)

    constructor(private authService: AuthService, private firebaseService: FirebaseService, private modalService: ModalService) {

    }
    ngAfterViewInit(): void {
        if (this.maybeValid()) {
            this.modalService.signUp(this.id())
        }
    }
}
