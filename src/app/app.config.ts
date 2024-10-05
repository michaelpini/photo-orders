import {ApplicationConfig, LOCALE_ID, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getDatabase, provideDatabase} from '@angular/fire/database';
import {getStorage, provideStorage} from '@angular/fire/storage';
import {provideHttpClient} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
    providers: [
        //provideZoneChangeDetection({eventCoalescing: true}),
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp({
            "projectId": "photo-orders-12b89",
            "appId": "1:646564049650:web:616098cf801c24ab8b566b",
            "databaseURL": "https://photo-orders-12b89-default-rtdb.europe-west1.firebasedatabase.app",
            "storageBucket": "photo-orders-12b89.appspot.com",
            "apiKey": "AIzaSyAfObhkzq4lv9UvrpoP5V1Nny3iNcXDMh4",
            "authDomain": "photo-orders-12b89.firebaseapp.com",
            "messagingSenderId": "646564049650",
            "measurementId": "G-1JR2G8H2H9"
        })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideStorage(() => getStorage()),
        {provide: LOCALE_ID, useValue: 'en-US'},
        {provide: LOCALE_ID, useValue: 'de-CH'},
    ]
};
