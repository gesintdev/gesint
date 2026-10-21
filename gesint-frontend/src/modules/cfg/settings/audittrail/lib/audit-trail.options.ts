import type {AuditCategory, AuditTrailPeriod} from "@/modules/cfg/settings/audittrail/dto/audit-trail.dto";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

export const AUDIT_CATEGORY_ITEMS: SelectItem[] = [
    {value: "SENSITIVE_DATA", label: "Dado sensível"},
    {value: "DECISION", label: "Decisão"},
    {value: "ACCESS", label: "Acesso"},
    {value: "EXPORT", label: "Exportação"},
    {value: "RECORD", label: "Cadastro"},
];

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = Object.fromEntries(
    AUDIT_CATEGORY_ITEMS.map((item) => [item.value, item.label]),
) as Record<AuditCategory, string>;

export const AUDIT_CATEGORY_BADGE_CLASSES: Record<AuditCategory, string> = {
    SENSITIVE_DATA: "gesint-badge--error",
    DECISION: "gesint-badge--warning",
    ACCESS: "gesint-badge--info",
    EXPORT: "gesint-badge--neutral",
    RECORD: "gesint-badge--neutral",
};

export const AUDIT_PERIOD_ITEMS: SelectItem[] = [
    {value: "7D", label: "Últimos 7 dias"},
    {value: "30D", label: "Últimos 30 dias"},
    {value: "90D", label: "Últimos 90 dias"},
    {value: "365D", label: "Últimos 12 meses"},
    {value: "ALL", label: "Todo o período"},
];

const PERIOD_DAYS: Record<AuditTrailPeriod, number | null> = {
    "7D": 7,
    "30D": 30,
    "90D": 90,
    "365D": 365,
    ALL: null,
};

/** Início do período em ISO (instante), ou `undefined` para todo o histórico. */
export function auditPeriodStart(period: AuditTrailPeriod, now = new Date()): string | undefined {
    const days = PERIOD_DAYS[period];
    if (days == null) return undefined;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - days);
    return start.toISOString();
}
