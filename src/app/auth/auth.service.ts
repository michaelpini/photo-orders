import {inject, Injectable} from '@angular/core';
import {fireAuth} from "../app.component";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword} from 'firebase/auth';
import {UserCredential, User as AuthUser} from "firebase/auth"
import {User} from "../customers/user.model";

const errorMessagesEN: {[key: string]: string} = {
    'EMAIL_EXISTS': 'This email exists already!',
    'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many failed attempts, try later again!',
    'INVALID_LOGIN_CREDENTIALS': 'Invalid email or password!',
    'EMAIL_NOT_FOUND': 'Invalid email!',
    'INVALID_PASSWORD': 'Invalid password!',
    'USER_DISABLED': 'User has been disabled!',
    'EMAIL_OR_PASSWORD_MISSING': 'Must provide email and password!',
    '': 'Unknown error!',
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    readonly store = inject(PhotoOrdersStore);

    constructor() {
        fireAuth.onAuthStateChanged(authState => {
            if (!this.store.authUser() && authState) {
                this.store.updateActiveUser(authState);
            } else if (authState == null) {
                this.store.updateActiveUser(null);
            }
            console.info(authState ? 'User login:' + authState.email : 'User logout');
        });
    }

    async signInEmail(email: string, password: string): Promise<void> {
        try {
            await signInWithEmailAndPassword(fireAuth, email, password);
        } catch (err: any) {
            const key = err?.message || '';
            const errorMessage = errorMessagesEN[key] || key;
            throw(errorMessage)
        }
    }

    async signUpEmail(email: string, password: string): Promise<User> {
        try {
            if (!email || !password) throw new Error('EMAIL_OR_PASSWORD_MISSING')
            const userCredential: UserCredential = await createUserWithEmailAndPassword(fireAuth, email, password);
            const user: AuthUser = userCredential.user;
            await fireAuth.updateCurrentUser(this.store.authUser());  // Login original user again
            return {
                id: user.uid,
                email:user.email,
                userName: email
            };
        } catch (err: any) {
            const error = err;
            console.log(error)
            const key = err?.message || '';
            const errorMessage = errorMessagesEN[key] || key;
            throw(errorMessage)
        }
    }

    async signOut(): Promise<void>{
        return fireAuth.signOut();
    }

    async sendResetEmail(email: string): Promise<void> {
        return (sendPasswordResetEmail(fireAuth, email));
    }

}

