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
        jobPositionId?: string;
        jobPositionName?: string;
        departmentId?: string;
        departmentName?: string;
        permissions?: string[];
        tenantSlug?: string;
        tenantName?: string;
        /** Null/omitido = host plataforma (sem filtro comercial). */
        contractedSystemKeys?: string[] | null;
        platformAdmin?: boolean;
    }
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        tenantSlug?: string;
        tenantName?: string;
        contractedSystemKeys?: string[] | null;
        platformAdmin?: boolean;
        error?: AuthTokenError;
        user: DefaultSession["user"] & {
            username?: string;
            collaboratorId?: string;
            photoObjectId?: string;
            jobPositionId?: string;
            jobPositionName?: string;
            departmentId?: string;
            departmentName?: string;
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
        error?: AuthTokenError;
        email?: string | null;
        username?: string;
        collaboratorId?: string;
        photoObjectId?: string;
        jobPositionId?: string;
        jobPositionName?: string;
        departmentId?: string;
        departmentName?: string;
        permissions?: string[];
        tenantSlug?: string;
        tenantName?: string;
        contractedSystemKeys?: string[] | null;
        platformAdmin?: boolean;
    }
}
