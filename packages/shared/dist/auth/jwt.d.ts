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
export declare function createAccessToken(env: AppEnv, payload: {
    sub: string;
    role: RoleEnum;
}): string;
export declare function createRefreshToken(env: AppEnv, payload: {
    sub: string;
    tokenId: string;
}): string;
export declare function verifyAccessToken(env: AppEnv, token: string): AccessTokenPayload;
export declare function verifyRefreshToken(env: AppEnv, token: string): RefreshTokenPayload;
