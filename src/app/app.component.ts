import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import * as deCH from '@angular/common/locales/de-CH';
import {NavComponent} from './nav/nav.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SpinnerComponent} from "./shared/spinner/spinner.component";
import {PhotoOrdersStore} from "./store/photoOrdersStore";

import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {AuthService} from "./auth/auth.service";

const firebaseConfig = {
    apiKey: "AIzaSyAfObhkzq4lv9UvrpoP5V1Nny3iNcXDMh4",
    authDomain: "photo-orders-12b89.firebaseapp.com",
    databaseURL: "https://photo-orders-12b89-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "photo-orders-12b89",
    storageBucket: "photo-orders-12b89.appspot.com",
    messagingSenderId: "646564049650",
    appId: "1:646564049650:web:616098cf801c24ab8b566b",
    measurementId: "G-1JR2G8H2H9"
};
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth();
export const firebaseStore = getFirestore();


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavComponent, FontAwesomeModule, SpinnerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent {
    store = inject(PhotoOrdersStore)
    constructor(
        private authService: AuthService, // Initialize for auto login
    ) {
        registerLocaleData(deCH.default);
    }
}
