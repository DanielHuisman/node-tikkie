import * as fs from 'fs';
import {URLSearchParams, format} from 'url';
import * as jwt from 'jsonwebtoken';

import {AccessToken} from './accessToken';
import {TikkieErrorCollection} from './error';

const PRODUCTION_API_URL = 'https://api.abnamro.com';
const PRODUCTION_TOKEN_AUDIENCE = 'https://auth.abnamro.com/oauth/token';
const SANDBOX_API_URL = 'https://api-sandbox.abnamro.com';
const SANDBOX_TOKEN_AUDIENCE = 'https://auth-sandbox.abnamro.com/oauth/token';

export class TikkieConfig {
    accessToken: AccessToken;
    apiKey: string;
    useSandbox: boolean;
    apiUrl: string;
    tokenAudience: string;
    privateKey: string;
    algorithm: string;

    constructor(apiKey: string, useSandbox: boolean = false) {
        this.apiKey = apiKey;
        this.useSandbox = useSandbox;
        this.apiUrl = useSandbox ? SANDBOX_API_URL : PRODUCTION_API_URL;
        this.tokenAudience = useSandbox ? SANDBOX_TOKEN_AUDIENCE : PRODUCTION_TOKEN_AUDIENCE;
    }

    loadPrivateKey(path: string, algorithm: string = 'RS256') {
        this.loadPrivateKeyFromString(fs.readFileSync(path, 'utf8'), algorithm);
    }

    loadPrivateKeyFromString(privateKey: string, algorithm: string = 'RS256') {
        this.privateKey = privateKey;
        this.algorithm = algorithm;
    }

    createHeaders(): Headers {
        const headers: Headers = new Headers();
        headers.append('User-Agent', 'node-tikkie/1.0');
        headers.append('API-Key', this.apiKey);
        return headers;
    }

    getJsonWebToken(): string {
        return jwt.sign({}, this.privateKey, {
            algorithm: this.algorithm,
            expiresIn: '3m',
            notBefore: '-1m',
            issuer: 'node-tikkie',
            subject: this.apiKey,
            audience: this.tokenAudience,
        });
    }

    getAccessToken = async (): Promise<string> => {
        if (!this.accessToken || this.accessToken.hasExpired()) {
            try {
                const body = new URLSearchParams();
                body.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
                body.append('client_assertion', this.getJsonWebToken());
                body.append('grant_type', 'client_credentials');
                body.append('scope', 'tikkie');

                const headers: Headers = this.createHeaders();
                headers.append('Content-Type', 'application/x-www-form-urlencoded');

                const response: Response = await fetch(`${this.apiUrl}/v1/oauth/token`, {
                    method: 'POST',
                    headers,
                    body,
                });

                const result = await response.json();

                if (response.status >= 200 && response.status <= 399) {
                    this.accessToken = new AccessToken(result);
                } else {
                    throw new TikkieErrorCollection(result.errors);
                }
            } catch (err) {
                throw err;
            }
        }
        return this.accessToken.token;
    }

    request = async (method: 'GET' | 'POST', endpoint: string, data: object | null = null): Promise<object> => {
        try {
            let token: string;
            try {
                token = await this.getAccessToken();
            } catch (err) {
                throw err;
            }

            const headers: Headers = this.createHeaders();
            headers.append('Authorization', `Bearer ${token}`);
            if (method === 'POST' && data) {
                headers.append('Content-Type', 'application/json');
            }

            let queryString = '';
            if (method === 'GET' && data) {
                queryString = format({query: data});
            }

            const response: Response = await fetch(`${this.apiUrl}${endpoint}${queryString}`, {
                method,
                headers,
                body: (method === 'POST' && data) ? JSON.stringify(data) : undefined,
            });
            const result = await response.json();

            if (response.status >= 200 && response.status <= 399) {
                return result;
            } else {
                throw new TikkieErrorCollection(result.errors);
            }
        } catch (err) {
            throw err;
        }
    }

    getRequest = (endpoint: string, query: object = {}): Promise<object> => this.request('GET', endpoint, query);
    postRequest = (endpoint: string, data: object = {}): Promise<object> => this.request('POST', endpoint, data);
}
