import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const DIGITAL_CERTIFICATE_PURPOSE_LABELS: Record<string, string> = {
    ESOCIAL: "eSocial",
    GENERAL: "Uso geral",
};

export const DIGITAL_CERTIFICATE_ENVIRONMENT_LABELS: Record<string, string> = {
    HOMOLOGATION: "Homologacao",
    PRODUCTION: "Producao",
};

export const DIGITAL_CERTIFICATE_PURPOSE_ITEMS: SelectItem[] = Object.entries(
    DIGITAL_CERTIFICATE_PURPOSE_LABELS,
).map(([value, label]) => ({ value, label }));

export const DIGITAL_CERTIFICATE_ENVIRONMENT_ITEMS: SelectItem[] = Object.entries(
    DIGITAL_CERTIFICATE_ENVIRONMENT_LABELS,
).map(([value, label]) => ({ value, label }));
