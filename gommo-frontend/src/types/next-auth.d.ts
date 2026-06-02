import type {AuthTokenError} from "@/auth/refresh-token";
import type {DefaultSession} from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        photoObjectId?: string;
    }

    interface Session {
        accessToken?: string;
        refreshToken?: string;
        error?: AuthTokenError;
        user: DefaultSession["user"] & {
            photoObjectId?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: AuthTokenError;
        email?: string | null;
        photoObjectId?: string;
    }
}
