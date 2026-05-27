import type { JWT } from "next-auth/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082";

/** Renova o access token ~60s antes de expirar */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export type AuthTokenError = "RefreshAccessTokenError" | "RefreshTokenMissing";

export function isAccessTokenExpired(token: JWT): boolean {
  const expires = token.accessTokenExpires;
  if (typeof expires !== "number") return true;
  return Date.now() >= expires - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshTokenMissing" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const data = (await response.json()) as TokenResponse;

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
