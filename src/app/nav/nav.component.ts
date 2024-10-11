import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {JsonPipe} from "@angular/common";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        JsonPipe
    ],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss'
})
export class NavComponent {
    collapsed = signal(true);
    readonly store = inject(PhotoOrdersStore);

}