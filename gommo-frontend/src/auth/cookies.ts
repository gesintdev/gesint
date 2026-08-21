const secureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = secureCookies ? "__Secure-gommo-hr" : "gommo-hr";

export const HR_SESSION_COOKIE_NAME = `${cookiePrefix}.authjs.session-token`;

export const hrAuthCookies = {
    sessionToken: {
        name: HR_SESSION_COOKIE_NAME,
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
