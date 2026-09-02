import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { isAccessTokenExpired, refreshAccessToken } from "@/auth/refresh-token";
import { setAuthToken } from "@/shared/lib/api.client";

class TokenResponse {
    accessToken!: string;
    refreshToken!: string;
    tokenType!: string;
    expiresInSeconds!: number;
    username?: string;
    email?: string;
}

/** Candidatos de Admin API no server (Auth.js / refresh). */
function resolveAdminApiBaseUrlCandidates(): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of [
        process.env.ADMIN_API_INTERNAL_URL,
        process.env.NEXT_PUBLIC_ADMIN_API_URL,
        "http://localhost:8082",
    ]) {
        const url = raw?.trim().replace(/\/$/, "");
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push(url);
    }
    return out;
}

/**
 * Login direto via fetch runtime. Tenta URL interna Docker e, se falhar,
 * a FQDN pública com TLS lab (NODE_TLS_REJECT_UNAUTHORIZED=0).
 */
async function loginAgainstAdminApi(username: string, password: string): Promise<TokenResponse> {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const errors: string[] = [];
    for (const baseUrl of resolveAdminApiBaseUrlCandidates()) {
        try {
            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ username, password }),
                cache: "no-store",
            });
            if (!response.ok) {
                const body = await response.text().catch(() => "");
                errors.push(`${baseUrl} → HTTP ${response.status}: ${body.slice(0, 120)}`);
                continue;
            }
            return (await response.json()) as TokenResponse;
        } catch (error) {
            errors.push(`${baseUrl} → ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    throw new Error(`Admin login failed on all bases: ${errors.join(" | ")}`);
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
    return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresInSeconds: expires,
        username: typeof credentials.username === "string" ? credentials.username : undefined,
        email: typeof credentials.email === "string" ? credentials.email : undefined,
    };
}

const secureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = secureCookies ? "__Secure-gommo-admin" : "gommo-admin";
const adminAuthCookies = {
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
    cookies: adminAuthCookies,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Usuário", type: "text" },
                password: { label: "Senha", type: "password" },
                accessToken: { label: "Access token", type: "text" },
                refreshToken: { label: "Refresh token", type: "text" },
                expiresInSeconds: { label: "Expires", type: "text" },
                email: { label: "Email", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }
                const username = credentials.username ? String(credentials.username).trim() : "";
                try {
                    // Preferência: tokens já obtidos no browser (evita fetch server→API no Coolify lab).
                    const fromClient = tokenResponseFromCredentials(credentials as Record<string, unknown>);
                    const data =
                        fromClient ??
                        (username && credentials.password
                            ? await loginAgainstAdminApi(username, String(credentials.password))
                            : null);
                    if (!data) {
                        return null;
                    }
                    const id = username || data.username || "admin";
                    setAuthToken(data.accessToken);
                    return {
                        id,
                        name: data.username ?? id,
                        email: data.email,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
                    };
                } catch (error) {
                    console.error("[gommo-admin auth] login failed:", error);
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const pathname = nextUrl.pathname;
            const isLogin = pathname.startsWith("/login");
            const isPublicAuth =
                pathname.startsWith("/definir-senha") || pathname.startsWith("/esqueci-senha");
            const isDocs = pathname.startsWith("/docs");

            if (isLogin || isPublicAuth) {
                return auth && isLogin ? Response.redirect(new URL("/clients/list", nextUrl)) : true;
            }

            // Docs: nao redireciona para login — o layout chama notFound() sem sessão.
            if (isDocs) {
                return true;
            }

            return !!auth;
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    sub: user.id,
                    name: user.name,
                    email: user.email,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
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
            session.error = token.error as typeof session.error;
            if (session.user) {
                session.user.name = (token.name as string | undefined) ?? session.user.name;
                session.user.email = (token.email as string | undefined) ?? session.user.email;
            }

            if (token.error) {
                session.accessToken = undefined;
            }
            return session;
        },
    },
    trustHost: true,
});
