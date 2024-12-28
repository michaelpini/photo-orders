import {ApplicationConfig, LOCALE_ID, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './routes/app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding()),
        {provide: LOCALE_ID, useValue: 'en-US'},
        {provide: LOCALE_ID, useValue: 'de-CH'},
    ]
};
