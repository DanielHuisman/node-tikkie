# Node.js Tikkie API

**Easily create payment requests through [Tikkie](https://tikkie.me/)**

Unofficial JavaScript implementation of the [Tikkie API](https://developer.abnamro.com/content/tikkie).

## Installation
```bash
yarn add tikkie
```

## Usage
```javascript
import {TikkieClient, TikkieConfig, PLATFORM_USAGE_MYSELF} from 'tikkie';

(async () => {
    const config = new TikkieConfig('apiKey');
    config.loadPrivateKey('path_to_key', 'RS256');

    const tikkie = new TikkieClient(config);

    try {
        const platform = await tikkie.createPlatform({
            name: 'NewPlatform',
            phoneNumber: '0601234567',
            email: 'x@yz.com',
            platformUsage: PLATFORM_USAGE_MYSELF
        });
        console.log(platform);

        const platforms = await tikkie.getPlatforms();
        console.log(platforms);

        const user = await tikkie.createUser(platform.platformToken, {
            name: 'NewUser',
            phoneNumber: '0601234567',
            iban: 'NL02ABNA0123456789',
            bankAccountLabel: 'Personal account'
        });
        console.log(user);

        const users = await tikkie.getUsers(platform.platformToken);
        console.log(users);

        const paymentRequest = await tikkie.createPaymentRequest(platform.platformToken, user.userToken, user.bankAccounts[0].bankAccountToken, {
            amountInCents: '123',
            currency: 'EUR',
            description: 'Last night\'s dinner',
            externalId: 'Invoice: 4567'
        });
        console.log(paymentRequest);

        const paymentRequests = await tikkie.getPaymentRequests(platform.platformToken, user.userToken);
        console.log(paymentRequests);

        const paymentRequest2 = await tikkie.getPaymentRequest(platform.platformToken, user.userToken, paymentRequest.paymentRequestToken);
        console.log(paymentRequest2);
    } catch (err) {
        console.error(err);
    }
})();
```

## Other languages
- [PHPTikkie](https://github.com/jarnovanleeuwen/php-tikkie) by Jarno van Leeuwen in PHP.
- [tikkie-api](https://github.com/KentaaNL/tikkie-api) by KentaaNL in Ruby.
