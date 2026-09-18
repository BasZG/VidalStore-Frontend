import { InjectionToken } from '@angular/core';
import {
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';

export interface AmplifyAuthPort {
  confirmSignUp: typeof confirmSignUp;
  fetchAuthSession: typeof fetchAuthSession;
  fetchUserAttributes: typeof fetchUserAttributes;
  getCurrentUser: typeof getCurrentUser;
  signInWithRedirect: typeof signInWithRedirect;
  signOut: typeof signOut;
  signUp: typeof signUp;
}

export const AMPLIFY_AUTH =
  new InjectionToken<AmplifyAuthPort>(
    'AMPLIFY_AUTH',
    {
      providedIn: 'root',
      factory: () => ({
        confirmSignUp,
        fetchAuthSession,
        fetchUserAttributes,
        getCurrentUser,
        signInWithRedirect,
        signOut,
        signUp,
      }),
    },
  );
