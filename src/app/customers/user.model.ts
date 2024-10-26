
export type Auth = 'admin' | 'user';
export type User = {
    auth?: Auth;
    companyName?: string | null;
    country?: string | null;
    email?: string | null;
    firstName?: string | null;
    id: string;
    isCompany?: boolean | null;
    lastName?: string | null;
    phone?: string | null;
    place?: string | null;
    plz?: string | null;
    streetAndNumber?: string | null;
    uid?: string | null;
    userName?: string | null;
    emailVerified?: boolean;
}

