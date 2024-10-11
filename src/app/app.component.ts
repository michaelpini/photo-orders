import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import * as deCH from '@angular/common/locales/de-CH';
import {NavComponent} from './nav/nav.component';
import {AuthService} from "./auth/auth.service";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"

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
export const fireApp = initializeApp(firebaseConfig);
export const fireAuth = getAuth();
export const fireStore = getFirestore();

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavComponent, FontAwesomeModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent {

    constructor(private authService: AuthService) {
        registerLocaleData(deCH.default);
    }

}
