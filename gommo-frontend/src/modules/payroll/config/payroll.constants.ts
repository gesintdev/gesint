import type { PayrollStatus } from "@/modules/payroll/dto/payroll-run.dto";
import type { PayrollEventType } from "@/modules/payroll/payroll-event/dto/payroll-event.dto";

export const PAYROLL_STATUS_ITEMS: { value: PayrollStatus; label: string }[] = [
    { value: "OPEN", label: "Aberta" },
    { value: "PROCESSING", label: "Processando" },
    { value: "PROCESSED", label: "Processada" },
    { value: "REVIEWED", label: "Revisada" },
    { value: "CLOSED", label: "Fechada" },
    { value: "CANCELLED", label: "Cancelada" },
    { value: "DRAFT", label: "Rascunho (legado)" },
];

export const PAYROLL_STATUS_LABELS: Record<string, string> = Object.fromEntries(
    PAYROLL_STATUS_ITEMS.map(({ value, label }) => [value, label]),
);

export const PAYROLL_EVENT_TYPE_ITEMS: { value: PayrollEventType; label: string }[] = [
    { value: "EARNING", label: "Provento" },
    { value: "DEDUCTION", label: "Desconto" },
    { value: "INFORMATIVE", label: "Informativo" },
];

export const PAYROLL_EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    PAYROLL_EVENT_TYPE_ITEMS.map(({ value, label }) => [value, label]),
);

export const BOOL_SELECT_ITEMS = [
    { value: "true", label: "Sim" },
    { value: "false", label: "Não" },
];
