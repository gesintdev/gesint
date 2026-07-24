import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { isAccessTokenExpired, refreshAccessToken } from "@/auth/refresh-token";
import { isPathAccessible } from "@/shared/auth/route-permissions";
import { AppException } from "@/shared/exceptions/app.exception";
import { apiFetch, setAuthToken } from "@/shared/lib/api.client";
import { buildTenantRequestHeaders } from "@/shared/lib/tenant";

class LoginRejectedError extends CredentialsSignin {
    constructor(code: string) {
        super();
        this.code = code;
    }
}

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60;

class TokenResponse {
    accessToken!: string;
    refreshToken!: string;
    tokenType!: string;
    expiresInSeconds!: number;
    name?: string;
    username?: string;
    email?: string;
    collaboratorId?: string;
    photoObjectId?: string;
    jobPositionId?: string;
    jobPositionName?: string;
    departmentId?: string;
    departmentName?: string;
    permissions?: string[];
    platformAdmin?: boolean;
    tenantSlug?: string;
    tenantName?: string;
    contractedSystemKeys?: string[] | null;
}

const secureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = secureCookies ? "__Secure-gommo-hr" : "gommo-hr";
const hrAuthCookies = {
    sessionToken: {
        name: `${cookiePrefix}.authjs.session-token`,
        options: {
            httpOnly: true,
            sameSite: "lax" as const,
            path: "/",
            secure: secureCookies,
        },
    },
    callbackUrl: {
        name: `${cookiePrefix}.authjs.callback-url`,
        options: {
            httpOnly: true,
            sameSite: "lax" as const,
            path: "/",
            secure: secureCookies,
        },
    },
    csrfToken: {
        name: `${cookiePrefix}.authjs.csrf-token`,
        options: {
            httpOnly: true,
            sameSite: "lax" as const,
            path: "/",
            secure: secureCookies,
        },
    },
};
export const { handlers, auth, signIn, signOut } = NextAuth({
    cookies: hrAuthCookies,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Usuário", type: "text" },
                password: { label: "Senha", type: "password" },
                tenantSlug: { label: "Tenant", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }
                const tenantSlug = (credentials.tenantSlug as string | undefined)?.trim() || undefined;
                try {
                    const data = await apiFetch<TokenResponse>("/api/v1/auth/login", {
                        method: "POST",
                        body: {
                            username: credentials.username,
                            password: credentials.password,
                        },
                        headers: buildTenantRequestHeaders(tenantSlug),
                    });
                    setAuthToken(data.accessToken);
                    const username = data.username ?? (credentials.username as string);
                    const displayName = data.name?.trim() || username;
                    return {
                        id: username,
                        name: displayName,
                        email: data.email,
                        username,
                        collaboratorId: data.collaboratorId,
                        photoObjectId: data.photoObjectId,
                        jobPositionId: data.jobPositionId,
                        jobPositionName: data.jobPositionName,
                        departmentId: data.departmentId,
                        departmentName: data.departmentName,
                        permissions: data.permissions ?? [],
                        platformAdmin: data.platformAdmin ?? false,
                        tenantSlug: data.tenantSlug ?? tenantSlug,
                        tenantName: data.tenantName,
                        contractedSystemKeys: data.contractedSystemKeys ?? null,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
                        refreshTokenIssuedAt: Date.now(),
                    };
                } catch (err) {
                    const code =
                        err instanceof AppException
                            ? err.code
                            : "AUTH_INVALID_CREDENTIALS";
                    console.error("[auth] login failed", {
                        tenantSlug,
                        username: credentials.username,
                        code,
                        error: err instanceof Error ? err.message : err,
                    });
                    throw new LoginRejectedError(code);
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE_SECONDS,
        updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    pages: { signIn: "/login" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const pathname = nextUrl.pathname;
            const isLogin = pathname.startsWith("/login");
            const isPublicAuth =
                pathname.startsWith("/definir-senha") || pathname.startsWith("/esqueci-senha");
            if (isLogin || isPublicAuth) {
                return auth && isLogin ? Response.redirect(new URL("/dashboard", nextUrl)) : true;
            }

            const isPublicCareers = pathname.startsWith("/careers");
            if (isPublicCareers) {
                return true;
            }

            if (!auth) {
                return Response.redirect(new URL("/login", nextUrl));
            }
            const granted = auth.user?.permissions ?? [];
            if (
                !isPathAccessible(pathname, granted, auth.contractedSystemKeys, {
                    tenantSlug: auth.tenantSlug,
                    platformAdmin: auth.platformAdmin,
                    contractedSystemKeys: auth.contractedSystemKeys,
                })
            ) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    sub: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    collaboratorId: user.collaboratorId,
                    photoObjectId: user.photoObjectId,
                    jobPositionId: user.jobPositionId,
                    jobPositionName: user.jobPositionName,
                    departmentId: user.departmentId,
                    departmentName: user.departmentName,
                    permissions: user.permissions,
                    platformAdmin: user.platformAdmin,
                    tenantSlug: user.tenantSlug,
                    tenantName: user.tenantName,
                    contractedSystemKeys: user.contractedSystemKeys ?? null,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    refreshTokenIssuedAt: user.refreshTokenIssuedAt,
                    accessTokenExpires: user.accessTokenExpires,
                    error: undefined,
                };
            }

            if (!isAccessTokenExpired(token)) {
                return token;
            }
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string | undefined;
            session.refreshToken = token.refreshToken as string | undefined;
            session.tenantSlug = token.tenantSlug as string | undefined;
            session.tenantName = token.tenantName as string | undefined;
            session.contractedSystemKeys =
                (token.contractedSystemKeys as string[] | null | undefined) ?? null;
            session.platformAdmin = token.platformAdmin as boolean | undefined;
            session.error = token.error as typeof session.error;
            if (session.user) {
                session.user.name = (token.name as string | undefined) ?? session.user.name;
                session.user.email = (token.email as string | undefined) ?? session.user.email;
                session.user.username = token.username as string | undefined;
                session.user.collaboratorId = token.collaboratorId as string | undefined;
                session.user.photoObjectId = token.photoObjectId as string | undefined;
                session.user.jobPositionId = token.jobPositionId as string | undefined;
                session.user.jobPositionName = token.jobPositionName as string | undefined;
                session.user.departmentId = token.departmentId as string | undefined;
                session.user.departmentName = token.departmentName as string | undefined;
                session.user.permissions = (token.permissions as string[] | undefined) ?? [];
            }

            if (token.error) {
                session.accessToken = undefined;
            }
            return session;
        },
    },
    trustHost: true,
});
