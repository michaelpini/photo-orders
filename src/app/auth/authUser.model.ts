export type AuthType = 'admin' | 'user';

export type AuthUser = {
    id: string;                 // auth.uid -> uid of logged-in user
    userName: string;           // auth.email -> email address of logged-in user
    emailVerified?: boolean;    // auth.emailVerified -> indicates whether user is verified
    userId: string;             // id of related user in firebase db 'users'
    authType?: AuthType;        // permissions of related user in firebase db 'users': admin | user - can only be set by admin user
}
