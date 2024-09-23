import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {BehaviorSubject, catchError, tap} from "rxjs";
import {User} from "./user.model";

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
    #user: User | null = null;
    #expireSignOutTimer?: number;
    public user$ = new BehaviorSubject<User | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        this.#signUpWithEmailUrl = this.#firebaseSignUpUrl.replace('[API_KEY]', this.#firebaseApiKey);
        this.#signInWithEmailUrl = this.#firebaseLoginUrl.replace('[API_KEY]', this.#firebaseApiKey)
    }

    get userToken(): string | null {
        return this.#user?.idToken || null;
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
        this.#user = new User(authResponse)
        this.user$.next(this.#user);
        localStorage.setItem('authUser', JSON.stringify(this.#user));
        this.autoSignOut(+this.#user?.getValidMilliSeconds());
    }

    signOut(): void {
        this.#user = null;
        this.user$.next(this.#user);
        localStorage.removeItem('authUser');
        clearTimeout(this.#expireSignOutTimer);
        this.#expireSignOutTimer = undefined;
        // this.router.navigate(['/signIn']);
        alert('You have been signed out.');
    }

    autoSignIn() {
        const userJSON = localStorage.getItem('authUser');
        if (!userJSON) return;
        this.#user = new User(userJSON);
        if (this.#user.idToken) {
            this.user$.next(this.#user);
            this.autoSignOut(this.#user.getValidMilliSeconds());
        }
    }

    autoSignOut(validMilliSeconds: number) {
        this.#expireSignOutTimer = window.setTimeout(this.signOut.bind(this), validMilliSeconds);
    }
}

