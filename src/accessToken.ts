interface AccessTokenInput {
    token_type: string;
    access_token: string;
    expires_in: number;
    scope: string;
}

export class AccessToken {
    private tokenType: string;
    public token: string;
    private expiresIn: number;
    private readonly expiry: Date;
    private scope: string;

    constructor(input: AccessTokenInput) {
        this.tokenType = input.token_type;
        this.token = input.access_token;
        this.expiresIn = input.expires_in;
        this.expiry = new Date(Date.now() + input.expires_in * 60);
        this.scope = input.scope;
    }

    hasExpired() {
        return new Date() >= this.expiry;
    }
}
