/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AuthHandler, SignInResolver } from '../types';
import { OAuthResult } from '../../lib/oauth';
import { createAuthProviderIntegration } from '../createAuthProviderIntegration';
import { createOAuthProviderFactory } from '@backstage/plugin-auth-node';
import {
  adaptLegacyOAuthHandler,
  adaptLegacyOAuthSignInResolver,
} from '../../lib/legacy';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';
import { TokenSet, UserinfoResponse } from 'openid-client';
import {
  commonByEmailLocalPartResolver,
  commonByEmailResolver,
} from '../resolvers';

/**
 * authentication result for the OIDC which includes the token set and user information (a profile response sent by OIDC server)
 * @public
 * @deprecated No longer used
 */
export type OidcAuthResult = {
  tokenset: TokenSet;
  userinfo: UserinfoResponse;
};

/**
 * Auth provider integration for generic OpenID Connect auth
 *
 * @public
 */
export const oidc = createAuthProviderIntegration({
  create(options?: {
    /**
     * The profile transformation function used to verify and convert the auth response
     * into the profile that will be presented to the user.
     */
    authHandler?: AuthHandler<OAuthResult>;

    /**
     * Configure sign-in for this provider, without it the provider can not be used to sign users in.
     */
    signIn?: {
      resolver: SignInResolver<OAuthResult>;
    };
  }) {
    return createOAuthProviderFactory({
      authenticator: oidcAuthenticator,
      profileTransform: adaptLegacyOAuthHandler(options?.authHandler),
      signInResolver: adaptLegacyOAuthSignInResolver(options?.signIn?.resolver),
    });
  },
  resolvers: {
    /**
     * Looks up the user by matching their email local part to the entity name.
     */
    emailLocalPartMatchingUserEntityName: () => commonByEmailLocalPartResolver,
    /**
     * Looks up the user by matching their email to the entity email.
     */
    emailMatchingUserEntityProfileEmail: () => commonByEmailResolver,
  },
});
