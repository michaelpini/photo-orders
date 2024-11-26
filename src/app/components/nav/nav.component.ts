import {AfterViewInit, Component, computed, effect, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {JsonPipe} from "@angular/common";
import {ModalService} from "../../modals/modal.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCircleUser as faUserSolid, faMoon} from "@fortawesome/free-solid-svg-icons";
import {faCircleUser as faUserOutline, faSun} from "@fortawesome/free-regular-svg-icons";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {faCircleHalfStroke} from "@fortawesome/free-solid-svg-icons/faCircleHalfStroke";

type Theme = 'light' | 'dark' | 'auto';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        JsonPipe,
        FaIconComponent,
        NgbDropdown,
        NgbDropdownMenu,
        NgbDropdownItem,
        NgbDropdownToggle,
        NgbTooltip
    ],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss'
})
export class NavComponent implements AfterViewInit{
    protected readonly faUserSolid = faUserSolid;
    protected readonly faUserOutline = faUserOutline;
    protected readonly themeIcons = {
        'auto': faCircleHalfStroke,
        'light': faSun,
        'dark': faMoon
    }
    readonly store = inject(PhotoOrdersStore);
    modalService = inject(ModalService);
    collapsed = signal(true);
    theme = signal<Theme>('auto');
    themeIcon = computed(() => this.themeIcons[this.theme()]);

    constructor() {
        effect(() => {
            if (this.collapsed()) {
                document.removeEventListener('click', this.onDocumentClick);
                document.removeEventListener("keydown", this.onKeyboardDown);
            } else {
                setTimeout(()=> {
                    document.addEventListener("click", this.onDocumentClick);
                    document.addEventListener("keydown", this.onKeyboardDown);
                })
            }
        })
    }

    onDocumentClick = () => {
        this.collapsed.set(true);
    }

    onKeyboardDown = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape' || ev.key === 'Enter') {
            this.collapsed.set(true);
        }
    }

    onSignIn() {
        this.modalService.signIn();
    }

    setTheme(theme: Theme) {
        this.theme.set(theme);
        if (theme === 'auto') {
            localStorage.removeItem('theme');
            const autoTheme =  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.applyTheme(autoTheme);
        } else {
            localStorage.setItem('theme', theme);
            this.applyTheme(theme);
        }
    }

    applyTheme(theme: 'light' | 'dark') {
        document.body.setAttribute('data-bs-theme', theme);
    }

    ngAfterViewInit(): void {
        let theme: Theme = localStorage.getItem('theme') as Theme || 'auto';
        this.setTheme(theme);
    }

}
