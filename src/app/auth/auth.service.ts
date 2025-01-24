import {inject, Injectable} from '@angular/core';
import {firebaseAuth} from "../../main";
import {PhotoOrdersStore} from "../store/photoOrdersStore";
import {FirebaseError} from "firebase/app"
import {createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, UserCredential, User as FirebaseAuthUser, updatePassword, updateEmail, sendEmailVerification} from 'firebase/auth';
import {delay} from "../shared/util";

type Lang = 'de' | 'en'
const errorMessagesArray: {[key: string]: {en: string, de: string }} = {
    'auth/email-already-in-use': {en: 'Email in use already!', de: 'Email bereits vergeben'},
    'auth/too-many-requests': {en: 'Too many failed attempts, try later again!', de: 'Zu viele Versuche, propiere es später nochmals'},
    'auth/invalid-credential': {en: 'Invalid email or password!', de: 'Email oder Passwort ungültig'},
    'auth/invalid-email': {en: 'Invalid email!', de: 'Ungültige Email!'},
    'auth/wrong-password': {en: 'Invalid password!', de: 'Falsches Passwort!'},
    'auth/user-disabled': {en: 'User has been disabled!', de: 'Konto ist gesperrt!'},
    'auth/missing-app-credential': {en: 'Must provide email and password!', de: 'Email und Passwort erforderlich!'},
    'auth/weak-password': {en: 'Weak password!', de: 'Unsicheres Passwort'},
    '': {en: 'Unknown error!', de: 'Unbekannter Fehler'},
}
const getError = (error: string | FirebaseError | Error | unknown, lang: Lang = 'de') => {
    if (typeof error === 'string') {
        return new Error(errorMessagesArray?.[error]?.[lang] || error);
    }
    if (error instanceof FirebaseError) {
        return new Error(errorMessagesArray?.[error.code]?.[lang] || error.code);
    }
    if (error instanceof Error) {
        return error
    }
    return new Error(String(error))
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    readonly store = inject(PhotoOrdersStore);

    constructor() {
        firebaseAuth.onAuthStateChanged(authState => {
            if (this.store.authInitializingNewUser()) return;
            this.store.setAuthUserAndActiveUser(authState?.uid);
            console.info(authState ? 'User login:' + authState.email : 'User logout');
        });
    }

    async signInEmail(email: string, password: string): Promise<void> {
        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
        } catch (err: any) {
            throw getError(err)
        }
    }

    async signUpEmail(email: string, password: string): Promise<FirebaseAuthUser> {
        if (!email || !password) throw getError('auth/missing-app-credential');
        try {
            const userCredential: UserCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            return userCredential.user;
        } catch (err: unknown) {
            throw getError(err)
        }
    }

    async signOut(): Promise<void>{
        return firebaseAuth.signOut();
    }

    async sendResetEmail(email: string): Promise<void> {
        await (sendPasswordResetEmail(firebaseAuth, email));
    }

    async sendEmailVerificationLink(): Promise<void> {
        await sendEmailVerification(firebaseAuth.currentUser!);
    }

    async changePassword(oldPassword: string, newPassword: string) {
        const user = firebaseAuth.currentUser;
        if (!user || !user.email) throw new Error('No user or user email!');
        this.store.setAuthInitializingNewUser(true);
        await signInWithEmailAndPassword(firebaseAuth, user.email, oldPassword);
        await delay(1000);
        this.store.setAuthInitializingNewUser(false);
        await updatePassword(user, newPassword);
    }

    async changeEmail(newEmail: string, password: string) {
        const user = firebaseAuth.currentUser;
        if (!user || !user.email) throw new Error('No user or user email!');
        await signInWithEmailAndPassword(firebaseAuth, user.email, password);
        await delay(3000);
        await updateEmail(user, newEmail);
    }


}
