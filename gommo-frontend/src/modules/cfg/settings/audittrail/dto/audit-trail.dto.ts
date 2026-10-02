export type AuditCategory = "RECORD" | "SENSITIVE_DATA" | "DECISION" | "ACCESS" | "EXPORT";

export type AuditTrailPeriod = "7D" | "30D" | "90D" | "365D" | "ALL";

export type AuditTrailEntry = {
    id: string;
    occurredAt: string;
    userId?: string | null;
    username?: string | null;
    userName?: string | null;
    category: AuditCategory;
    categoryDescription: string;
    action: string;
    actionDescription: string;
    actionLabel: string;
    entityName: string;
    entityId?: string | null;
    recordLabel?: string | null;
    reason?: string | null;
    ipAddress?: string | null;
};

export type AuditTrailRow = AuditTrailEntry & {
    actorLabel: string;
};

export type AuditTrailSearchParams = {
    period: AuditTrailPeriod;
    category?: AuditCategory;
    search?: string;
};
