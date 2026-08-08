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

/** Base URL do Admin API no server (Auth.js). Preferir HTTP interno Docker. */
function resolveAdminApiBaseUrl(): string {
    const internal = process.env.ADMIN_API_INTERNAL_URL?.trim();
    if (internal) {
        return internal.replace(/\/$/, "");
    }
    return (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082").replace(/\/$/, "");
}

/**
 * Login direto via fetch runtime — evita baseUrl capturado no load do módulo
 * e TLS self-signed do Traefik quando a URL pública *.local é usada.
 */
async function loginAgainstAdminApi(username: string, password: string): Promise<TokenResponse> {
    const baseUrl = resolveAdminApiBaseUrl();
    if (baseUrl.includes(".local") || process.env.GOMMO_TLS_INSECURE === "true") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
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
        throw new Error(`Admin login HTTP ${response.status} via ${baseUrl}: ${body.slice(0, 200)}`);
    }
    return (await response.json()) as TokenResponse;
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
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }
                const username = String(credentials.username).trim();
                const password = String(credentials.password);
                try {
                    const data = await loginAgainstAdminApi(username, password);
                    setAuthToken(data.accessToken);
                    return {
                        id: username,
                        name: data.username ?? username,
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
