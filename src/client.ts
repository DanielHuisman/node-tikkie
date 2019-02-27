import {TikkieConfig} from './config';

export class TikkieClient {
    config: TikkieConfig;

    /**
     * Initialize TikkieClient.
     *
     * @param {TikkieConfig} config Configuration object.
     */
    constructor(config: TikkieConfig) {
        this.config = config;
    }

    /**
     * Manually authenticate with the Tikkie API.
     * TikkieClient will automatically connect before making the first request.
     */
    async authenticate() {
        try {
            await this.config.getAccessToken();
        } catch (err) {
            throw err;
        }
    }

    createPlatform = (data: object) => this.config.postRequest('/v1/tikkie/platforms', data);
    getPlatforms = () => this.config.getRequest('/v1/tikkie/platforms');

    createUser = (platformToken: string, data: object) => this.config.postRequest(`/v1/tikkie/platforms/${platformToken}/users`, data);
    getUsers = (platformToken: string) => this.config.getRequest(`/v1/tikkie/platforms/${platformToken}/users`);

    createPaymentRequest = (platformToken: string, userToken: string, bankAccountToken: string, data: object) =>
        this.config.postRequest(`/v1/tikkie/platforms/${platformToken}/users/${userToken}/bankaccounts/${bankAccountToken}/paymentrequests`, data)
    getPaymentRequests = (platformToken: string, userToken: string, query: object) =>
        this.config.getRequest(`/v1/tikkie/platforms/${platformToken}/users/${userToken}/paymentrequests`, query)
    getPaymentRequest = (platformToken: string, userToken: string, paymentRequestToken: string) =>
        this.config.getRequest(`/v1/tikkie/platforms/${platformToken}/users/${userToken}/paymentrequests/${paymentRequestToken}`)
}
