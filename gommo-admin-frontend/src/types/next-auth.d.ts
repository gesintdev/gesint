import "next-auth";
import "next-auth/jwt";

import type { AuthTokenError } from "@/auth/refresh-token";
declare module "next-auth" {
    interface User {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
    }
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        error?: AuthTokenError;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: AuthTokenError;
        email?: string | null;
    }
}
