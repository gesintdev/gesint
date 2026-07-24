/** Preferência de tema do usuário (cookie `gommo-theme`). Default: light. */
export type ThemePreference = "light" | "dark" | "system";

export const THEME_COOKIE_KEY = "gommo-theme";
export const THEME_STORAGE_KEY = "theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Valor persistido pelo next-themes / data-theme DaisyUI. */
export type NextThemeValue = "gommo" | "dark" | "system";

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
    return value === "light" || value === "dark" || value === "system";
}

export function preferenceToNextTheme(preference: ThemePreference): NextThemeValue {
    if (preference === "light") return "gommo";
    return preference;
}

export function nextThemeToPreference(theme: string | undefined | null): ThemePreference {
    if (theme === "dark") return "dark";
    if (theme === "system") return "system";
    return "light";
}

export function readThemePreferenceCookie(): ThemePreference | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_KEY}=([^;]*)`));
    const raw = match ? decodeURIComponent(match[1]) : null;
    return isThemePreference(raw) ? raw : null;
}

export function writeThemePreferenceCookie(preference: ThemePreference): void {
    if (typeof document === "undefined") return;
    document.cookie = `${THEME_COOKIE_KEY}=${encodeURIComponent(preference)};path=/;max-age=${THEME_COOKIE_MAX_AGE};SameSite=Lax`;
}

export function resolveThemePreference(): ThemePreference {
    const fromCookie = readThemePreferenceCookie();
    if (fromCookie) return fromCookie;
    if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "system") return stored;
        if (stored === "gommo" || stored === "light") return "light";
    }
    return "light";
}

/** Aplica preferência no cookie, localStorage e (opcionalmente) no next-themes. */
export function persistThemePreference(
    preference: ThemePreference,
    setTheme?: (theme: string) => void,
): void {
    writeThemePreferenceCookie(preference);
    const nextTheme = preferenceToNextTheme(preference);
    if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
    applyDocumentTheme(preference);
    setTheme?.(nextTheme);
}

function resolveSystemTheme(): "gommo" | "dark" {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "gommo";
}

export function applyDocumentTheme(preference: ThemePreference = resolveThemePreference()): void {
    if (typeof document === "undefined") return;
    const resolved =
        preference === "system" ? resolveSystemTheme() : preferenceToNextTheme(preference) === "dark" ? "dark" : "gommo";
    document.documentElement.setAttribute("data-theme", resolved === "dark" ? "dark" : "gommo");
}
