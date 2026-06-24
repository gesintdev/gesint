import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const LEAVE_TYPE_VALUES = [
    "VACATION",
    "MEDICAL",
    "MEDICAL_CERTIFICATE",
    "SICK_LEAVE_INSS",
    "OCCUPATIONAL_ACCIDENT",
    "MATERNITY",
    "PATERNITY",
    "BEREAVEMENT",
    "MARRIAGE",
    "BLOOD_DONATION",
    "ELECTORAL_SERVICE",
    "MILITARY_SERVICE",
    "JURY_DUTY",
    "UNION_REPRESENTATION",
    "UNPAID",
    "UNPAID_LEAVE",
    "SUSPENSION",
    "UNJUSTIFIED_ABSENCE",
    "OTHER",
] as const;

export type LeaveType = (typeof LEAVE_TYPE_VALUES)[number];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    VACATION: "Férias",
    MEDICAL: "Afastamento médico",
    MEDICAL_CERTIFICATE: "Atestado médico",
    SICK_LEAVE_INSS: "Auxílio-doença / INSS",
    OCCUPATIONAL_ACCIDENT: "Acidente de trabalho",
    MATERNITY: "Licença-maternidade",
    PATERNITY: "Licença-paternidade",
    BEREAVEMENT: "Falecimento",
    MARRIAGE: "Casamento",
    BLOOD_DONATION: "Doação de sangue",
    ELECTORAL_SERVICE: "Serviço eleitoral",
    MILITARY_SERVICE: "Serviço militar",
    JURY_DUTY: "Júri / audiência",
    UNION_REPRESENTATION: "Representação sindical",
    UNPAID: "Não remunerado",
    UNPAID_LEAVE: "Licença não remunerada",
    SUSPENSION: "Suspensão do contrato",
    UNJUSTIFIED_ABSENCE: "Falta injustificada",
    OTHER: "Outro",
};

export const LEAVE_TYPE_ITEMS: SelectItem[] = LEAVE_TYPE_VALUES.map((value) => ({
    value,
    label: LEAVE_TYPE_LABELS[value],
}));

export const ABSENCE_TYPE_ITEMS: SelectItem[] = LEAVE_TYPE_ITEMS.filter((item) => item.value !== "VACATION");
