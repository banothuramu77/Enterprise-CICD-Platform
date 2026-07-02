import { HttpError, RoleEnum, type AppEnv } from '@enterprise/shared';
import type { PrismaClient } from '@prisma/client';
import { createSessionTokens } from '../auth/token.service.js';

interface GithubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GithubUserResponse {
  id: number;
  login: string;
  email?: string | null;
  name?: string | null;
}

interface GithubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function githubOAuthLogin(prisma: PrismaClient, env: AppEnv, code: string) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    throw new HttpError(500, 'GitHub OAuth is not configured', 'OAUTH_MISCONFIGURED');
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenPayload = (await tokenResponse.json()) as GithubTokenResponse;
  if (!tokenPayload.access_token) {
    throw new HttpError(401, 'GitHub OAuth failed to return an access token', 'OAUTH_FAILED', tokenPayload);
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      Accept: 'application/json',
    },
  });

  const githubUser = (await userResponse.json()) as GithubUserResponse;
  if (!githubUser || !githubUser.id) {
    throw new HttpError(401, 'GitHub user profile could not be loaded', 'OAUTH_FAILED');
  }

  let email = githubUser.email;
  if (!email) {
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        Accept: 'application/json',
      },
    });
    const emails = (await emailResponse.json()) as GithubEmailResponse[];
    const verified = emails.find((entry) => entry.primary && entry.verified) ?? emails[0];
    email = verified?.email;
  }

  if (!email) {
    throw new HttpError(400, 'GitHub account did not return a usable email', 'OAUTH_MISSING_EMAIL');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const user = existingUser
    ? existingUser
    : await prisma.user.create({
        data: {
          email,
          fullName: githubUser.name ?? githubUser.login,
          role: RoleEnum.USER,
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
        },
      });

  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'github',
        providerAccountId: String(githubUser.id),
      },
    },
    update: {
      accessToken: tokenPayload.access_token,
      providerAccountId: String(githubUser.id),
    },
    create: {
      provider: 'github',
      providerAccountId: String(githubUser.id),
      accessToken: tokenPayload.access_token,
      userId: user.id,
    },
  });

  return createSessionTokens(prisma, env, user.id, user.role);
}
