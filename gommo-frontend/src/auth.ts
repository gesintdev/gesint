import { isAccessTokenExpired, refreshAccessToken } from "@/auth/refresh-token";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isPathAccessible } from "@/shared/auth/route-permissions";
import { apiFetch, setAuthToken } from "@/shared/lib/api.client";
import { buildTenantRequestHeaders } from "@/shared/lib/tenant";
class TokenResponse {
    accessToken!: string;
    refreshToken!: string;
    tokenType!: string;
    expiresInSeconds!: number;
    username?: string;
    email?: string;
    photoObjectId?: string;
    permissions?: string[];
    platformAdmin?: boolean;
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
                    return {
                        id: credentials.username as string,
                        name: data.username ?? (credentials.username as string),
                        email: data.email,
                        photoObjectId: data.photoObjectId,
                        permissions: data.permissions ?? [],
                        platformAdmin: data.platformAdmin ?? false,
                        tenantSlug,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLogin = nextUrl.pathname.startsWith("/login");
            if (isLogin) {
                return auth ? Response.redirect(new URL("/dashboard", nextUrl)) : true;
            }

            if (!auth) {
                return Response.redirect(new URL("/login", nextUrl));
            }
            const granted = auth.user?.permissions ?? [];
            if (!isPathAccessible(nextUrl.pathname, granted)) {
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
                    photoObjectId: user.photoObjectId,
                    permissions: user.permissions,
                    platformAdmin: user.platformAdmin,
                    tenantSlug: user.tenantSlug,
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
            session.tenantSlug = token.tenantSlug as string | undefined;
            session.platformAdmin = token.platformAdmin as boolean | undefined;
            session.error = token.error as typeof session.error;
            if (session.user) {
                session.user.name = (token.name as string | undefined) ?? session.user.name;
                session.user.email = (token.email as string | undefined) ?? session.user.email;
                session.user.photoObjectId = token.photoObjectId as string | undefined;
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
