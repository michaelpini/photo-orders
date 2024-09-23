import {AuthResponse} from "./auth.service";

export class User {
    public readonly id: string;
    public readonly email: string;
    public readonly refreshToken: string;
    private readonly _idToken: string;
    private readonly _expiresOn: number


    constructor(userJSON: string);
    constructor(authResponse: AuthResponse);
    constructor(param: AuthResponse | string)  {
        if (typeof param === "string") {
            const user: User = JSON.parse(param);
            this.id = user.id;
            this.email = user.email;
            this.refreshToken = user.refreshToken;
            this._idToken = user._idToken;
            this._expiresOn = user._expiresOn;
        } else {
            this.id = param.localId;
            this.email = param.email;
            this.refreshToken = param.refreshToken;
            this._idToken = param.idToken;
            this._expiresOn = new Date().getTime() + +param.expiresIn * 1000;
        }
    }

    getValidMilliSeconds(): number {
        const milliSeconds = this._expiresOn - new Date().getTime();
        return milliSeconds > 0 ? milliSeconds : 0;
    }

    get idToken() :string {
        return this.getValidMilliSeconds() ? this._idToken : '';
    }
}
