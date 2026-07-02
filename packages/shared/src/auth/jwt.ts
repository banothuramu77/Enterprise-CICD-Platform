import * as jwt from 'jsonwebtoken';
import type { AppEnv } from '../config/env.js';
import { RoleEnum } from '../types/role.js';

export interface AccessTokenPayload {
  sub: string;
  role: RoleEnum;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
}

export function createAccessToken(env: AppEnv, payload: { sub: string; role: RoleEnum }): string {
  const secret: jwt.Secret = env.JWT_ACCESS_TOKEN_SECRET;
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: payload.sub, role: payload.role, type: 'access' }, secret, options);
}

export function createRefreshToken(env: AppEnv, payload: { sub: string; tokenId: string }): string {
  const secret: jwt.Secret = env.JWT_REFRESH_TOKEN_SECRET;
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: payload.sub, tokenId: payload.tokenId, type: 'refresh' }, secret, options);
}

export function verifyAccessToken(env: AppEnv, token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(env: AppEnv, token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}
