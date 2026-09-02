import "next-auth/jwt";

import type { DefaultSession } from "next-auth";

import type { AuthTokenError } from "@/auth/refresh-token";
import type { Branch } from "@/shared/lib/branch";
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
        /** Null/omitido = host plataforma (sem filtro comercial). Valem em qualquer filial. */
        contractedSystemKeys?: string[] | null;
        /** Filiais cujo conjunto de keys foge da base. */
        contractedSystemKeyOverrides?: Record<string, string[]> | null;
        /** Filiais que o usuario pode operar; alimenta o seletor do header. */
        branches?: Branch[];
        platformAdmin?: boolean;
    }
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        tenantSlug?: string;
        tenantName?: string;
        contractedSystemKeys?: string[] | null;
        contractedSystemKeyOverrides?: Record<string, string[]> | null;
        branches?: Branch[];
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
        /** Falhas transitórias consecutivas de /auth/refresh (zerado no sucesso). */
        refreshFailureCount?: number;
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
        contractedSystemKeyOverrides?: Record<string, string[]> | null;
        branches?: Branch[];
        platformAdmin?: boolean;
    }
}
