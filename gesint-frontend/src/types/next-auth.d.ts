import "next-auth/jwt";

import type { DefaultSession } from "next-auth";

import type { AuthTokenError } from "@/auth/refresh-token";

declare module "next-auth" {
    interface User {
        accessToken?: string;
        refreshToken?: string;
        refreshTokenIssuedAt?: number;
        accessTokenExpires?: number;
        username?: string;
        collaboratorId?: string;
        photoObjectId?: string;
        tenantSlug?: string;
        tenantName?: string;
        platformAdmin?: boolean;
    }
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        tenantSlug?: string;
        tenantName?: string;
        platformAdmin?: boolean;
        error?: AuthTokenError;
        user: DefaultSession["user"] & {
            username?: string;
            collaboratorId?: string;
            photoObjectId?: string;
            /** Derivado do access token (decode), nao armazenado no cookie. */
            permissions?: string[];
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        refreshTokenIssuedAt?: number;
        accessTokenExpires?: number;
        refreshRetryAfter?: number;
        /** Falhas transitórias consecutivas de /auth/refresh (zerado no sucesso). */
        refreshFailureCount?: number;
        error?: AuthTokenError;
        email?: string | null;
        username?: string;
        collaboratorId?: string;
        photoObjectId?: string;
        tenantSlug?: string;
        tenantName?: string;
        platformAdmin?: boolean;
    }
}
