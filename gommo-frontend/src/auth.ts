import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { readPermissionsFromAccessToken } from "@/auth/access-token-claims";
import { hrAuthCookies } from "@/auth/cookies";
import { isAccessTokenExpired, refreshAccessToken } from "@/auth/refresh-token";
import { isPathAccessible } from "@/shared/auth/route-permissions";
import { AppException } from "@/shared/exceptions/app.exception";
import { serverApiPost } from "@/shared/lib/server-api";
import { buildTenantRequestHeaders } from "@/shared/lib/tenant";

class LoginRejectedError extends CredentialsSignin {
    constructor(code: string) {
        super();
        this.code = code;
    }
}

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60;

/** Login/refresh enxuto: identidade + tokens. Resto vem de GET /auth/me. */
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
    platformAdmin?: boolean;
    tenantSlug?: string;
    tenantName?: string;
}

function tokenResponseFromCredentials(credentials: Record<string, unknown>): TokenResponse | null {
    const accessToken = credentials.accessToken;
    const refreshToken = credentials.refreshToken;
    const expiresInSeconds = credentials.expiresInSeconds;
    if (
        typeof accessToken !== "string" ||
        !accessToken ||
        typeof refreshToken !== "string" ||
        !refreshToken
    ) {
        return null;
    }
    const expires =
        typeof expiresInSeconds === "string" || typeof expiresInSeconds === "number"
            ? Number(expiresInSeconds)
            : NaN;
    if (!Number.isFinite(expires) || expires <= 0) {
        return null;
    }

    const asString = (value: unknown) => (typeof value === "string" ? value : undefined);

    return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresInSeconds: expires,
        name: asString(credentials.name),
        username: asString(credentials.username),
        email: asString(credentials.email),
        collaboratorId: asString(credentials.collaboratorId),
        photoObjectId: asString(credentials.photoObjectId),
        platformAdmin: credentials.platformAdmin === true || credentials.platformAdmin === "true",
        tenantSlug: asString(credentials.tenantSlug),
        tenantName: asString(credentials.tenantName),
    };
}

async function loginAgainstHrApi(
    username: string,
    password: string,
    tenantSlug?: string,
): Promise<TokenResponse> {
    const result = await serverApiPost(
        "/api/v1/auth/login",
        { username, password },
        buildTenantRequestHeaders(tenantSlug),
    );
    if (result.status === 401 || result.status === 403) {
        throw new LoginRejectedError("AUTH_INVALID_CREDENTIALS");
    }
    if (!result.ok) {
        throw new Error(`${result.baseUrl} → HTTP ${result.status}: ${result.text.slice(0, 200)}`);
    }
    return result.json as TokenResponse;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    cookies: hrAuthCookies,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Usuário", type: "text" },
                password: { label: "Senha", type: "password" },
                tenantSlug: { label: "Tenant", type: "text" },
                accessToken: { label: "Access token", type: "text" },
                refreshToken: { label: "Refresh token", type: "text" },
                expiresInSeconds: { label: "Expires", type: "text" },
                name: { label: "Name", type: "text" },
                email: { label: "Email", type: "text" },
                collaboratorId: { label: "Collaborator", type: "text" },
                photoObjectId: { label: "Photo", type: "text" },
                platformAdmin: { label: "Platform admin", type: "text" },
                tenantName: { label: "Tenant name", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }
                const tenantSlug = (credentials.tenantSlug as string | undefined)?.trim() || undefined;
                const usernameHint = (credentials.username as string | undefined)?.trim() || "";
                try {
                    const fromClient = tokenResponseFromCredentials(credentials as Record<string, unknown>);
                    const data =
                        fromClient ??
                        (usernameHint && credentials.password
                            ? await loginAgainstHrApi(usernameHint, String(credentials.password), tenantSlug)
                            : null);
                    if (!data) {
                        return null;
                    }
                    const username = data.username ?? usernameHint;
                    const displayName = data.name?.trim() || username;
                    return {
                        id: username,
                        name: displayName,
                        email: data.email,
                        username,
                        collaboratorId: data.collaboratorId,
                        photoObjectId: data.photoObjectId,
                        platformAdmin: data.platformAdmin ?? false,
                        tenantSlug: data.tenantSlug ?? tenantSlug,
                        tenantName: data.tenantName,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
                        refreshTokenIssuedAt: Date.now(),
                    };
                } catch (err) {
                    const code =
                        err instanceof LoginRejectedError
                            ? err.code
                            : err instanceof AppException
                              ? err.code
                              : "AUTH_INVALID_CREDENTIALS";
                    console.error("[auth] login failed", {
                        tenantSlug,
                        username: usernameHint,
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
        authorized({ auth, request }) {
            const { nextUrl } = request;
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
            // Permissions flat do access token; sistemas contratados / rail ficam no bootstrap (client).
            const granted = readPermissionsFromAccessToken(auth.accessToken);
            if (
                !isPathAccessible(pathname, granted, null, {
                    tenantSlug: auth.tenantSlug,
                    platformAdmin: auth.platformAdmin,
                    contractedSystemKeys: null,
                    skipCommercialFilter: true,
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
                    platformAdmin: user.platformAdmin,
                    tenantSlug: user.tenantSlug,
                    tenantName: user.tenantName,
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
            session.accessTokenExpires = token.accessTokenExpires as number | undefined;
            session.tenantSlug = token.tenantSlug as string | undefined;
            session.tenantName = token.tenantName as string | undefined;
            session.platformAdmin = token.platformAdmin as boolean | undefined;
            session.error = token.error as typeof session.error;
            if (session.user) {
                session.user.name = (token.name as string | undefined) ?? session.user.name;
                session.user.email = (token.email as string | undefined) ?? session.user.email;
                session.user.username = token.username as string | undefined;
                session.user.collaboratorId = token.collaboratorId as string | undefined;
                session.user.photoObjectId = token.photoObjectId as string | undefined;
                session.user.permissions = readPermissionsFromAccessToken(token.accessToken);
            }

            if (token.error) {
                session.accessToken = undefined;
            }
            return session;
        },
    },
    trustHost: true,
});
