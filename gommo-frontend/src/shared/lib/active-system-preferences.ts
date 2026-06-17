import { SystemEnum, SystemEnumHelper } from "@/modules/root/enum/SystemEnum";

const SETTINGS_MODE_COOKIE_KEY = "gommo-settings-mode";

export function parseSettingsModeCookie(value: string | undefined): boolean {
    return value === "1";
}

export function parseActiveSystemCookie(value: string | undefined): SystemEnum | null {
    return SystemEnumHelper.parseStoredSystemCookie(value);
}

export { SETTINGS_MODE_COOKIE_KEY };
