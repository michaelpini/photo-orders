import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {catchError, from, Observable, tap} from "rxjs";
import {AuthUser} from "./user.model";
import {PhotoStore} from "../store/photoStore";
import {fbAuth} from "../app.component";
import {createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';


// export interface AuthResponseHTTP {
//     email: string;
//     idToken: string;
//     localId: string;
//     expiresIn: string;
// }
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
    // #firebaseSignUpUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]'
    // #firebaseLoginUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]'
    // #firebaseApiKey = 'AIzaSyAfObhkzq4lv9UvrpoP5V1Nny3iNcXDMh4';
    // #signUpWithEmailUrl: string;
    // #signInWithEmailUrl: string;
    #expireSignOutTimer?: number;
    readonly store = inject(PhotoStore);




    constructor(private http: HttpClient, private router: Router) {
        // this.#signUpWithEmailUrl = this.#firebaseSignUpUrl.replace('[API_KEY]', this.#firebaseApiKey);
        // this.#signInWithEmailUrl = this.#firebaseLoginUrl.replace('[API_KEY]', this.#firebaseApiKey);
        fbAuth.onAuthStateChanged(authState => {console.log(authState);});
    }

    signInEmail(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(fbAuth, email, password))
            .pipe(tap((res: any) => this.onSignInSuccess(res.user)))
            .pipe(catchError(err => {
                const key = err?.message || '';
                const errorMessage = errorMessagesEN[key] || key;
                this.store.setAuthError(errorMessage)
                throw(errorMessage)
            }))
    }

    signUpEmail(email: string, password: string): Observable<UserCredential> {
        return from(createUserWithEmailAndPassword(fbAuth, email, password))
            .pipe(tap((res: any) => this.onSignUpSuccess(res.user)))
            .pipe(catchError(err => {
                const key = err?.message || '';
                const errorMessage = errorMessagesEN[key] || key;
                throw(errorMessage)
            }))
    }

    // signInEmailHTTP(email: string, password: string): Observable<AuthResponseHTTP> {
    //     return this.http.post<AuthResponseHTTP>(this.#signInWithEmailUrl, {email, password, returnSecureToken: true})
    //         .pipe(tap(res => this.onSignInSuccess(res)))
    //         .pipe(catchError(err => {
    //             const key = err?.error?.error?.message || '';
    //             const errorMessage = errorMessagesEN[key] || key;
    //             this.store.setAuthError(errorMessage)
    //             throw(errorMessage)
    //         }))
    // }

    // signUpEmailHTTP(email: string, password: string): Observable<AuthResponseHTTP> {
    //     return this.http.post<AuthResponseHTTP>(this.#signUpWithEmailUrl, {email, password, returnSecureToken: true})
    //         .pipe(tap(res => this.onSignUpSuccess(res)))
    //         .pipe(catchError(err => {
    //             const key = err?.error?.error?.message || '';
    //             const errorMessage = errorMessagesEN[key] || key;
    //             this.store.setAuthError(errorMessage)
    //             throw(errorMessage)
    //         }))
    // }

    onSignInSuccess(authResponse: AuthResponseSDK) {
        const user = new AuthUser(<any>authResponse)
        this.store.updateAuthUser(user);
        this.store.setAuthError();
        localStorage.setItem('authUser', JSON.stringify(user));
        this.autoSignOut(+user?.getValidMilliSeconds());
    }

    onSignUpSuccess(authResponse: AuthResponseSDK) {
        //Todo: Add user users
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
        if (user.idToken) {
            this.store.updateAuthUser(user);
            this.autoSignOut(user.getValidMilliSeconds());
        }
    }

    autoSignOut(validMilliSeconds: number) {
        this.#expireSignOutTimer = window.setTimeout(() => this.signOut(), validMilliSeconds);
    }

    sendResetEmail(email: string) {
        sendPasswordResetEmail(fbAuth, email)
            .then(() => {
                // Password reset email sent!
                // ..
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
    }
}

