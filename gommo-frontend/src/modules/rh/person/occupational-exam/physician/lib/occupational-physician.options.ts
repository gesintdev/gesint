import { BRAZIL_STATE_CODES } from "@/modules/rh/person/jobvacancy/lib/careers-form.util";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const OCCUPATIONAL_PHYSICIAN_ROLE_LABELS: Record<string, string> = {
    EXAMINER: "Examinador",
    PCMSO_COORDINATOR: "Coordenador PCMSO",
};

export const OCCUPATIONAL_PHYSICIAN_ROLE_ITEMS: SelectItem[] = Object.entries(
    OCCUPATIONAL_PHYSICIAN_ROLE_LABELS,
).map(([value, label]) => ({ value, label }));

export const BRAZIL_UF_ITEMS: SelectItem[] = BRAZIL_STATE_CODES.map((code) => ({
    value: code,
    label: code,
}));
