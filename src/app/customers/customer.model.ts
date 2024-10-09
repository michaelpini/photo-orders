export type Auth = 'admin' | 'user';
export type User = {
    id: string;
    userName?: string;
    auth?: Auth;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isCompany?: boolean;
    companyName?: string;
    streetAndNumber?: string;
    place?: string;
    plz?: string;
    country?: string;
}

export class Customer implements User{
    id: string = '';
    userName?: string;
    auth?: Auth;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isCompany?: boolean = false;
    companyName?: string;
    streetAndNumber?: string;
    place?: string;
    plz?: string;
    country?: string;
    
    constructor(id: string, email: string)
    constructor()
    constructor(id?: string, email?: string) {
        if (id) {
            this.id = id;
            this.userName = email;
            this.email = email;
            this.firstName = 'Neuer';
            this.lastName = 'Kunde';
            this.auth = 'user';
        }
    }
}

