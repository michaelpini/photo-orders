import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {catchError, from, map, Observable, tap} from "rxjs";
import {AuthUser} from "./authUser.model";
import {PhotoStore} from "../store/photoStore";
import {fbAuth} from "../app.component";
import {createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword} from 'firebase/auth';

export interface AuthResponseSDK {
    email: string;
    uid: string;
    accessToken: string;
    stsTokenManager: {expirationTime: number};
}

const errorMessagesEN: {[key: string]: string} = {
    'EMAIL_EXISTS': 'This email exists already!',
    'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many failed attempts, try later again!',
    'INVALID_LOGIN_CREDENTIALS': 'Invalid email or password!',
    'EMAIL_NOT_FOUND': 'Invalid email!',
    'INVALID_PASSWORD': 'Invalid password!',
    'USER_DISABLED': 'User has been disabled!',
    '': 'Unknown error!',
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    #expireSignOutTimer?: number;
    readonly store = inject(PhotoStore);

    constructor(private http: HttpClient, private router: Router) {
        fbAuth.onAuthStateChanged(authState => {console.log(authState);});
    }

    signInEmail(email: string, password: string): Observable<AuthUser> {
        return from(signInWithEmailAndPassword(fbAuth, email, password))
            .pipe(map((res: any) => this.onSignInSuccess(res.user)))
            .pipe(catchError(err => {
                const key = err?.message || '';
                const errorMessage = errorMessagesEN[key] || key;
                this.store.setAuthError(errorMessage)
                throw(errorMessage)
            }))
    }

    signUpEmail(email: string, password: string): Observable<AuthUser> {
        return from(createUserWithEmailAndPassword(fbAuth, email, password))
            .pipe(map((res: any) => this.onSignUpSuccess(res.user)))
            .pipe(catchError(err => {
                const key = err?.message || '';
                const errorMessage = errorMessagesEN[key] || key;
                throw(errorMessage)
            }))
    }

    onSignInSuccess(authResponse: AuthResponseSDK): AuthUser {
        const user = new AuthUser(authResponse);
        this.store.updateAuthUser(user);
        this.store.setAuthError();
        localStorage.setItem('authUser', JSON.stringify(user));
        this.autoSignOut(+user?.getValidMilliSeconds());
        return user;
    }

    onSignUpSuccess(authResponse: AuthResponseSDK): AuthUser {
        return new AuthUser(authResponse);
    }

    signOut(): Observable<void>{
        return from(fbAuth.signOut())
            .pipe(tap(() => {
                this.store.updateAuthUser();
                localStorage.removeItem('authUser');
                clearTimeout(this.#expireSignOutTimer);
                this.#expireSignOutTimer = undefined;
                alert('You have been signed out.');
            }))
    }

    autoSignIn() {
        const userJSON = localStorage.getItem('authUser');
        if (!userJSON) return;
        const user = new AuthUser(userJSON);
        if (user.token) {
            this.store.updateAuthUser(user);
            this.autoSignOut(user.getValidMilliSeconds());
        }
    }

    autoSignOut(validMilliSeconds: number) {
        this.#expireSignOutTimer = window.setTimeout(() => this.signOut(), validMilliSeconds);
    }

    sendResetEmail(email: string) {
        return from(sendPasswordResetEmail(fbAuth, email))
    }
}

