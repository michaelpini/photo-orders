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

// Todo: Delete code types before deploying
type AUTH_ERROR_CODES_MAP_DO_NOT_USE_INTERNALLY = {
    readonly ADMIN_ONLY_OPERATION: "auth/admin-restricted-operation";
    readonly ARGUMENT_ERROR: "auth/argument-error";
    readonly APP_NOT_AUTHORIZED: "auth/app-not-authorized";
    readonly APP_NOT_INSTALLED: "auth/app-not-installed";
    readonly CAPTCHA_CHECK_FAILED: "auth/captcha-check-failed";
    readonly CODE_EXPIRED: "auth/code-expired";
    readonly CORDOVA_NOT_READY: "auth/cordova-not-ready";
    readonly CORS_UNSUPPORTED: "auth/cors-unsupported";
    readonly CREDENTIAL_ALREADY_IN_USE: "auth/credential-already-in-use";
    readonly CREDENTIAL_MISMATCH: "auth/custom-token-mismatch";
    readonly CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "auth/requires-recent-login";
    readonly DEPENDENT_SDK_INIT_BEFORE_AUTH: "auth/dependent-sdk-initialized-before-auth";
    readonly DYNAMIC_LINK_NOT_ACTIVATED: "auth/dynamic-link-not-activated";
    readonly EMAIL_CHANGE_NEEDS_VERIFICATION: "auth/email-change-needs-verification";
    readonly EMAIL_EXISTS: "auth/email-already-in-use";
    readonly EMULATOR_CONFIG_FAILED: "auth/emulator-config-failed";
    readonly EXPIRED_OOB_CODE: "auth/expired-action-code";
    readonly EXPIRED_POPUP_REQUEST: "auth/cancelled-popup-request";
    readonly INTERNAL_ERROR: "auth/internal-error";
    readonly INVALID_API_KEY: "auth/invalid-api-key";
    readonly INVALID_APP_CREDENTIAL: "auth/invalid-app-credential";
    readonly INVALID_APP_ID: "auth/invalid-app-id";
    readonly INVALID_AUTH: "auth/invalid-user-token";
    readonly INVALID_AUTH_EVENT: "auth/invalid-auth-event";
    readonly INVALID_CERT_HASH: "auth/invalid-cert-hash";
    readonly INVALID_CODE: "auth/invalid-verification-code";
    readonly INVALID_CONTINUE_URI: "auth/invalid-continue-uri";
    readonly INVALID_CORDOVA_CONFIGURATION: "auth/invalid-cordova-configuration";
    readonly INVALID_CUSTOM_TOKEN: "auth/invalid-custom-token";
    readonly INVALID_DYNAMIC_LINK_DOMAIN: "auth/invalid-dynamic-link-domain";
    readonly INVALID_EMAIL: "auth/invalid-email";
    readonly INVALID_EMULATOR_SCHEME: "auth/invalid-emulator-scheme";
    readonly INVALID_IDP_RESPONSE: "auth/invalid-credential";
    readonly INVALID_LOGIN_CREDENTIALS: "auth/invalid-credential";
    readonly INVALID_MESSAGE_PAYLOAD: "auth/invalid-message-payload";
    readonly INVALID_MFA_SESSION: "auth/invalid-multi-factor-session";
    readonly INVALID_OAUTH_CLIENT_ID: "auth/invalid-oauth-client-id";
    readonly INVALID_OAUTH_PROVIDER: "auth/invalid-oauth-provider";
    readonly INVALID_OOB_CODE: "auth/invalid-action-code";
    readonly INVALID_ORIGIN: "auth/unauthorized-domain";
    readonly INVALID_PASSWORD: "auth/wrong-password";
    readonly INVALID_PERSISTENCE: "auth/invalid-persistence-type";
    readonly INVALID_PHONE_NUMBER: "auth/invalid-phone-number";
    readonly INVALID_PROVIDER_ID: "auth/invalid-provider-id";
    readonly INVALID_RECIPIENT_EMAIL: "auth/invalid-recipient-email";
    readonly INVALID_SENDER: "auth/invalid-sender";
    readonly INVALID_SESSION_INFO: "auth/invalid-verification-id";
    readonly INVALID_TENANT_ID: "auth/invalid-tenant-id";
    readonly MFA_INFO_NOT_FOUND: "auth/multi-factor-info-not-found";
    readonly MFA_REQUIRED: "auth/multi-factor-auth-required";
    readonly MISSING_ANDROID_PACKAGE_NAME: "auth/missing-android-pkg-name";
    readonly MISSING_APP_CREDENTIAL: "auth/missing-app-credential";
    readonly MISSING_AUTH_DOMAIN: "auth/auth-domain-config-required";
    readonly MISSING_CODE: "auth/missing-verification-code";
    readonly MISSING_CONTINUE_URI: "auth/missing-continue-uri";
    readonly MISSING_IFRAME_START: "auth/missing-iframe-start";
    readonly MISSING_IOS_BUNDLE_ID: "auth/missing-ios-bundle-id";
    readonly MISSING_OR_INVALID_NONCE: "auth/missing-or-invalid-nonce";
    readonly MISSING_MFA_INFO: "auth/missing-multi-factor-info";
    readonly MISSING_MFA_SESSION: "auth/missing-multi-factor-session";
    readonly MISSING_PHONE_NUMBER: "auth/missing-phone-number";
    readonly MISSING_SESSION_INFO: "auth/missing-verification-id";
    readonly MODULE_DESTROYED: "auth/app-deleted";
    readonly NEED_CONFIRMATION: "auth/account-exists-with-different-credential";
    readonly NETWORK_REQUEST_FAILED: "auth/network-request-failed";
    readonly NULL_USER: "auth/null-user";
    readonly NO_AUTH_EVENT: "auth/no-auth-event";
    readonly NO_SUCH_PROVIDER: "auth/no-such-provider";
    readonly OPERATION_NOT_ALLOWED: "auth/operation-not-allowed";
    readonly OPERATION_NOT_SUPPORTED: "auth/operation-not-supported-in-this-environment";
    readonly POPUP_BLOCKED: "auth/popup-blocked";
    readonly POPUP_CLOSED_BY_USER: "auth/popup-closed-by-user";
    readonly PROVIDER_ALREADY_LINKED: "auth/provider-already-linked";
    readonly QUOTA_EXCEEDED: "auth/quota-exceeded";
    readonly REDIRECT_CANCELLED_BY_USER: "auth/redirect-cancelled-by-user";
    readonly REDIRECT_OPERATION_PENDING: "auth/redirect-operation-pending";
    readonly REJECTED_CREDENTIAL: "auth/rejected-credential";
    readonly SECOND_FACTOR_ALREADY_ENROLLED: "auth/second-factor-already-in-use";
    readonly SECOND_FACTOR_LIMIT_EXCEEDED: "auth/maximum-second-factor-count-exceeded";
    readonly TENANT_ID_MISMATCH: "auth/tenant-id-mismatch";
    readonly TIMEOUT: "auth/timeout";
    readonly TOKEN_EXPIRED: "auth/user-token-expired";
    readonly TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests";
    readonly UNAUTHORIZED_DOMAIN: "auth/unauthorized-continue-uri";
    readonly UNSUPPORTED_FIRST_FACTOR: "auth/unsupported-first-factor";
    readonly UNSUPPORTED_PERSISTENCE: "auth/unsupported-persistence-type";
    readonly UNSUPPORTED_TENANT_OPERATION: "auth/unsupported-tenant-operation";
    readonly UNVERIFIED_EMAIL: "auth/unverified-email";
    readonly USER_CANCELLED: "auth/user-cancelled";
    readonly USER_DELETED: "auth/user-not-found";
    readonly USER_DISABLED: "auth/user-disabled";
    readonly USER_MISMATCH: "auth/user-mismatch";
    readonly USER_SIGNED_OUT: "auth/user-signed-out";
    readonly WEAK_PASSWORD: "auth/weak-password";
    readonly WEB_STORAGE_UNSUPPORTED: "auth/web-storage-unsupported";
    readonly ALREADY_INITIALIZED: "auth/already-initialized";
    readonly RECAPTCHA_NOT_ENABLED: "auth/recaptcha-not-enabled";
    readonly MISSING_RECAPTCHA_TOKEN: "auth/missing-recaptcha-token";
    readonly INVALID_RECAPTCHA_TOKEN: "auth/invalid-recaptcha-token";
    readonly INVALID_RECAPTCHA_ACTION: "auth/invalid-recaptcha-action";
    readonly MISSING_CLIENT_TYPE: "auth/missing-client-type";
    readonly MISSING_RECAPTCHA_VERSION: "auth/missing-recaptcha-version";
    readonly INVALID_RECAPTCHA_VERSION: "auth/invalid-recaptcha-version";
    readonly INVALID_REQ_TYPE: "auth/invalid-req-type";
}

