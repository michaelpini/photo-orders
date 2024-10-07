import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import * as deCH from '@angular/common/locales/de-CH';
import {HeaderComponent} from './header/header.component';
import {AuthService} from "./auth/auth.service";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {getAuth} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
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
export const fbApp = initializeApp(firebaseConfig);
export const fbAuth = getAuth();
export const fbDb = getDatabase();
export const fbFs = getFirestore();

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FontAwesomeModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {

    constructor(private authService: AuthService) {
        registerLocaleData(deCH.default);
    }

    ngOnInit(): void {
        this.authService.autoSignIn();
    }
}
