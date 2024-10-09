import {ApplicationConfig, LOCALE_ID, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
    providers: [
        //provideZoneChangeDetection({eventCoalescing: true}),
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        {provide: LOCALE_ID, useValue: 'en-US'},
        {provide: LOCALE_ID, useValue: 'de-CH'},
    ]
};
