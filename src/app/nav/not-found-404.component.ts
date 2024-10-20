import {Component} from "@angular/core";

@Component({
    selector: "not-found-404",
    standalone: true,
    template: `
        <div class="container-fluid d-flex flex-column justify-content-center align-items-center">
            <img src="404-page-not-found.svg" class="w-50">
            <h1>Hier gibt's nichts zu sehen.</h1>
        </div>
    `,
    styles: ``,
})
export class NotFoundComponent {

}
