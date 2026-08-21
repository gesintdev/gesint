import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { hrAuthCookies } from "@/auth/cookies";
import { isAccessTokenExpired, refreshAccessToken } from "@/auth/refresh-token";
import { isPathAccessible } from "@/shared/auth/route-permissions";
import { AppException } from "@/shared/exceptions/app.exception";
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

/** Candidatos de HR API no server (Auth.js / fallback). */
function resolveHrApiBaseUrlCandidates(): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of [
        process.env.API_INTERNAL_URL,
        process.env.NEXT_PUBLIC_API_URL,
        "http://localhost:8081",
    ]) {
        const url = raw?.trim().replace(/\/$/, "");
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push(url);
    }
    return out;
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
    const asStringArray = (value: unknown): string[] | null | undefined => {
        if (value == null) return value as null | undefined;
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value) as unknown;
                return Array.isArray(parsed) ? parsed.map(String) : undefined;
            } catch {
                return undefined;
            }
        }
        return Array.isArray(value) ? value.map(String) : undefined;
    };

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
        jobPositionId: asString(credentials.jobPositionId),
        jobPositionName: asString(credentials.jobPositionName),
        departmentId: asString(credentials.departmentId),
        departmentName: asString(credentials.departmentName),
        permissions: asStringArray(credentials.permissions) ?? [],
        platformAdmin: credentials.platformAdmin === true || credentials.platformAdmin === "true",
        tenantSlug: asString(credentials.tenantSlug),
        tenantName: asString(credentials.tenantName),
        contractedSystemKeys: asStringArray(credentials.contractedSystemKeys) ?? null,
    };
}

async function loginAgainstHrApi(
    username: string,
    password: string,
    tenantSlug?: string,
): Promise<TokenResponse> {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const errors: string[] = [];
    for (const baseUrl of resolveHrApiBaseUrlCandidates()) {
        try {
            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...buildTenantRequestHeaders(tenantSlug),
                },
                body: JSON.stringify({ username, password }),
                cache: "no-store",
            });
            if (!response.ok) {
                const body = await response.text().catch(() => "");
                errors.push(`${baseUrl} → HTTP ${response.status}: ${body.slice(0, 120)}`);
                if (response.status === 401 || response.status === 403) {
                    throw new LoginRejectedError("AUTH_INVALID_CREDENTIALS");
                }
                continue;
            }
            return (await response.json()) as TokenResponse;
        } catch (error) {
            if (error instanceof LoginRejectedError) {
                throw error;
            }
            errors.push(`${baseUrl} → ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    throw new Error(`HR login failed on all bases: ${errors.join(" | ")}`);
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
                jobPositionId: { label: "Job position id", type: "text" },
                jobPositionName: { label: "Job position", type: "text" },
                departmentId: { label: "Department id", type: "text" },
                departmentName: { label: "Department", type: "text" },
                permissions: { label: "Permissions", type: "text" },
                platformAdmin: { label: "Platform admin", type: "text" },
                tenantName: { label: "Tenant name", type: "text" },
                contractedSystemKeys: { label: "Systems", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }
                const tenantSlug = (credentials.tenantSlug as string | undefined)?.trim() || undefined;
                const usernameHint = (credentials.username as string | undefined)?.trim() || "";
                try {
                    // Preferência: tokens já obtidos no browser via /api/auth/client-login.
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
