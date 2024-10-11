
export type Auth = 'admin' | 'user';
export type User = {
    id: string;
    userName?: string | null;
    auth?: Auth;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    isCompany?: boolean | null;
    companyName?: string | null;
    streetAndNumber?: string | null;
    place?: string | null;
    plz?: string | null;
    country?: string | null;
}

