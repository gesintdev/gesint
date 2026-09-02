import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { readPermissionsFromAccessToken } from "@/auth/access-token-claims";
import { hrAuthCookies } from "@/auth/cookies";
import { isAccessTokenExpired, refreshAccessToken } from "@/auth/refresh-token";
import { isPathAccessible } from "@/shared/auth/route-permissions";
import { ACTIVE_BRANCH_COOKIE_KEY, type Branch } from "@/shared/lib/branch";
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
    contractedSystemKeyOverrides?: Record<string, string[]> | null;
    branches?: Branch[];
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

    const asKeyOverrides = (value: unknown): Record<string, string[]> | null => {
        let raw: unknown = value;
        if (typeof value === "string") {
            try {
                raw = JSON.parse(value);
            } catch {
                return null;
            }
        }
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
        const entries = Object.entries(raw as Record<string, unknown>)
            .filter(([, keys]) => Array.isArray(keys))
            .map(([branchId, keys]) => [branchId, (keys as unknown[]).map(String)] as const);
        return entries.length > 0 ? Object.fromEntries(entries) : null;
    };

    const asBranches = (value: unknown): Branch[] => {
        let raw: unknown = value;
        if (typeof value === "string") {
            try {
                raw = JSON.parse(value);
            } catch {
                return [];
            }
        }
        return Array.isArray(raw) ? (raw as Branch[]).filter((item) => item && typeof item.id === "string") : [];
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
        platformAdmin: credentials.platformAdmin === true || credentials.platformAdmin === "true",
        tenantSlug: asString(credentials.tenantSlug),
        tenantName: asString(credentials.tenantName),
        contractedSystemKeys: asStringArray(credentials.contractedSystemKeys) ?? null,
        contractedSystemKeyOverrides: asKeyOverrides(credentials.contractedSystemKeyOverrides),
        branches: asBranches(credentials.branches),
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
                jobPositionId: { label: "Job position id", type: "text" },
                jobPositionName: { label: "Job position", type: "text" },
                departmentId: { label: "Department id", type: "text" },
                departmentName: { label: "Department", type: "text" },
                platformAdmin: { label: "Platform admin", type: "text" },
                tenantName: { label: "Tenant name", type: "text" },
                contractedSystemKeys: { label: "Systems", type: "text" },
                contractedSystemKeyOverrides: { label: "Systems by branch", type: "text" },
                branches: { label: "Branches", type: "text" },
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
                        platformAdmin: data.platformAdmin ?? false,
                        tenantSlug: data.tenantSlug ?? tenantSlug,
                        tenantName: data.tenantName,
                        contractedSystemKeys: data.contractedSystemKeys ?? null,
                        contractedSystemKeyOverrides: data.contractedSystemKeyOverrides ?? null,
                        branches: data.branches ?? [],
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
            const granted = auth.user?.permissions ?? [];
            // A rota vale pela filial em que o usuário está: um sistema restrito a algumas filiais
            // não existe nas keys base, e sem isto a navegação seria recusada onde ele vale.
            const activeBranchId = request.cookies.get(ACTIVE_BRANCH_COOKIE_KEY)?.value;
            const branchKeys =
                (activeBranchId && auth.contractedSystemKeyOverrides?.[activeBranchId]) ||
                auth.contractedSystemKeys;
            if (
                !isPathAccessible(pathname, granted, branchKeys, {
                    tenantSlug: auth.tenantSlug,
                    platformAdmin: auth.platformAdmin,
                    contractedSystemKeys: branchKeys,
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
                    platformAdmin: user.platformAdmin,
                    tenantSlug: user.tenantSlug,
                    tenantName: user.tenantName,
                    contractedSystemKeys: user.contractedSystemKeys ?? null,
                    contractedSystemKeyOverrides: user.contractedSystemKeyOverrides ?? null,
                    branches: user.branches ?? [],
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
            session.contractedSystemKeys =
                (token.contractedSystemKeys as string[] | null | undefined) ?? null;
            session.contractedSystemKeyOverrides =
                (token.contractedSystemKeyOverrides as Record<string, string[]> | null | undefined) ?? null;
            session.branches = (token.branches as Branch[] | undefined) ?? [];
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
