import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {PhotoStore} from "../store/photoStore";
import {JsonPipe} from "@angular/common";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        JsonPipe
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    collapsed = signal(true);
    readonly store = inject(PhotoStore);

}
