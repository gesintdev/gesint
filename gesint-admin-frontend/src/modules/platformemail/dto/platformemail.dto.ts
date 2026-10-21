export type PlatformEmailSecurity = "STARTTLS" | "SSL" | "NONE";

export type PlatformEmailSettings = {
    persisted: boolean;
    enabled: boolean;
    host?: string | null;
    port?: number | null;
    security: PlatformEmailSecurity;
    username?: string | null;
    passwordConfigured: boolean;
    fromAddress?: string | null;
    fromName?: string | null;
    replyTo?: string | null;
    lastTestAt?: string | null;
    lastTestSuccess?: boolean | null;
    lastTestMessage?: string | null;
    updatedAt?: string | null;
};

export type PlatformEmailSettingsUpsertDto = {
    enabled: boolean;
    host?: string;
    port?: number;
    security: PlatformEmailSecurity;
    username?: string;
    password?: string;
    clearPassword: boolean;
    fromAddress?: string;
    fromName?: string;
    replyTo?: string;
};
