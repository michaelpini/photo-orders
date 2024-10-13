import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';

import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {registerLocaleData} from "@angular/common";
import * as deCH from '@angular/common/locales/de-CH';

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


bootstrapApplication(AppComponent, appConfig)
    .then(() => {
        registerLocaleData(deCH.default);

    })
    .catch((err) => console.error(err));

