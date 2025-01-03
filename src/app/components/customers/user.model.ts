
export type User = {
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
    remarks?: string;
    streetAndNumber?: string | null;
    customerNumber?: string | null;
    userId?: string;     // same as id, but needed for security rules
}

