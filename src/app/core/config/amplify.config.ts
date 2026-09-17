import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sessionStorage } from 'aws-amplify/utils';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_kEQF95sY0',
      userPoolClientId: '43e5hri7r4d1cet653qume2l64',

      loginWith: {
        oauth: {
          domain: 'us-east-1keqf95sy0.auth.us-east-1.amazoncognito.com',

          scopes: [
            'openid',
            'email',
            'phone',
            'vidalstore/catalogo.leer',
            'vidalstore/catalogo.escribir',
            'vidalstore/biblioteca.leer',
          ],

          redirectSignIn: [
            'http://localhost:4200/callback',
          ],

          redirectSignOut: [
            'http://localhost:4200/',
          ],

          responseType: 'code',
        },
      },
    },
  },
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);
