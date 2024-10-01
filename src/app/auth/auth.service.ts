import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {catchError, tap} from "rxjs";
import {User} from "./user.model";
import {PhotoStore} from "../store/photoStore";

export interface AuthResponse {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    #firebaseSignUpUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]'
    #firebaseLoginUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]'
    #firebaseApiKey = 'AIzaSyAfObhkzq4lv9UvrpoP5V1Nny3iNcXDMh4';
    #signUpWithEmailUrl: string;
    #signInWithEmailUrl: string;
    #expireSignOutTimer?: number;
    readonly store = inject(PhotoStore);


    constructor(private http: HttpClient, private router: Router) {
        this.#signUpWithEmailUrl = this.#firebaseSignUpUrl.replace('[API_KEY]', this.#firebaseApiKey);
        this.#signInWithEmailUrl = this.#firebaseLoginUrl.replace('[API_KEY]', this.#firebaseApiKey)
    }

    signUpEmail(email: string, password: string) {
        return this.http.post<AuthResponse>(this.#signUpWithEmailUrl, {email, password, returnSecureToken: true})
            .pipe(tap(res => this.onSignInSuccess(res)))
            .pipe(catchError(err => {
                const errMsg = err?.error?.error?.message || 'Unknown error!'
                switch (errMsg) {
                    case 'EMAIL_EXISTS':
                        throw('This email exists already!');
                    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                        throw('Too many failed attempts, try later again!');
                    default:
                        throw(errMsg);
                }
            }))
    }

    signInEmail(email: string, password: string) {
        return this.http.post<AuthResponse>(this.#signInWithEmailUrl, {email, password, returnSecureToken: true})
            .pipe(tap(res => this.onSignInSuccess(res)))
            .pipe(catchError(err => {
                const errMsg = err?.error?.error?.message || 'Unknown error!'
                switch (errMsg) {
                    case 'INVALID_LOGIN_CREDENTIALS':
                        throw('Invalid email or password!');
                    case 'EMAIL_NOT_FOUND':
                        throw('Invalid email!');
                    case 'INVALID_PASSWORD':
                        throw('Invalid password!');
                    case 'USER_DISABLED':
                        throw('User has been disabled!');
                    default:
                        throw(errMsg);
                }
            }))
    }

    onSignInSuccess(authResponse: AuthResponse) {
        const user = new User(authResponse)
        this.store.updateAuthUser(user);
        localStorage.setItem('authUser', JSON.stringify(user));
        this.autoSignOut(+user?.getValidMilliSeconds());
    }

    signOut(): void {
        this.store.updateAuthUser(null);
        localStorage.removeItem('authUser');
        clearTimeout(this.#expireSignOutTimer);
        this.#expireSignOutTimer = undefined;
        alert('You have been signed out.');
        // this.router.navigate(['/signIn']);
    }

    autoSignIn() {
        const userJSON = localStorage.getItem('authUser');
        if (!userJSON) return;
        const user = new User(userJSON);
        if (user.idToken) {
            this.store.updateAuthUser(user);
            this.autoSignOut(user.getValidMilliSeconds());
        }
    }

    autoSignOut(validMilliSeconds: number) {
        this.#expireSignOutTimer = window.setTimeout(() => this.signOut(), validMilliSeconds);
    }
}

