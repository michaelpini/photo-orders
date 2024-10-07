import {/*AuthResponseHTTP, */AuthResponseSDK} from "./auth.service";

export class AuthUser {
    public readonly id: string;
    public readonly email: string;
    public auth: string = 'user;'
    private readonly _idToken: string;
    private readonly _expiresOn: number

    constructor(authResponse: AuthResponseSDK);
    // constructor(authResponse: AuthResponseHTTP);
    constructor(userJSON: string);
    constructor(param: /*AuthResponseHTTP | */AuthResponseSDK | string)  {
        if (typeof param === "string") {
            const user: AuthUser = JSON.parse(param);
            this.id = user.id;
            this.email = user.email;
            this._idToken = user._idToken;
            this._expiresOn = user._expiresOn;
        // } else if ('localId' in param) {
        //     this.id = param.localId;
        //     this.email = param.email;
        //     this._idToken = param.idToken;
        //     this._expiresOn = new Date().getTime() + +param.expiresIn * 1000;
        } else /*if ("uid" in param)*/ {
            this.id = param.uid;
            this.email = param.email;
            this._idToken = param.accessToken;
            this._expiresOn = param.stsTokenManager.expirationTime;
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
