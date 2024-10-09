import {AuthResponseSDK} from "./auth.service";

export class AuthUser {
    public id: string;
    public email: string;
    readonly _token: string;
    readonly _expiresOn: number

    constructor(authResponse: AuthResponseSDK);
    constructor(userJSON: string);
    constructor(param: AuthResponseSDK | string)  {
        if (typeof param === "string") {
            const user: AuthUser = JSON.parse(param);
            this.id = user.id;
            this.email = user.email;
            this._token = user._token;
            this._expiresOn = user._expiresOn;
        } else {
            this.id = param.uid;
            this.email = param.email;
            this._token = param.accessToken;
            this._expiresOn = param.stsTokenManager.expirationTime;
        }
    }

    getValidMilliSeconds(): number {
        const milliSeconds = this._expiresOn - new Date().getTime();
        return milliSeconds > 0 ? milliSeconds : 0;
    }

    get token() :string {
        return this.getValidMilliSeconds() ? this._token : '';
    }
}
