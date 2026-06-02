import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/auth/refresh-token";
import { isPathAccessible } from "@/shared/auth/route-permissions";
import { apiFetch, setAuthToken } from "@/shared/lib/api.client";

class TokenResponse {
  accessToken!: string;
  refreshToken!: string;
  tokenType!: string;
  expiresInSeconds!: number;
  username?: string;
  email?: string;
  photoObjectId?: string;
  permissions?: string[];
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
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        try {
          const data = await apiFetch<TokenResponse>("/api/v1/auth/login", {
            method: "POST",
            body: {
              username: credentials.username,
              password: credentials.password,
            },
          });
          setAuthToken(data.accessToken);
          return {
            id: credentials.username as string,
            name: data.username ?? (credentials.username as string),
            email: data.email,
            photoObjectId: data.photoObjectId,
            permissions: data.permissions ?? [],
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
      if (!auth) return false;

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
