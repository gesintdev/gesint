import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const JOB_POSITION_NATURE_ITEMS: SelectItem[] = [
    { value: "OPERATIONAL", label: "Operacional" },
    { value: "TECHNICAL", label: "Técnico" },
    { value: "SPECIALIST", label: "Especialista" },
    { value: "LEADERSHIP", label: "Gestão" },
    { value: "EXECUTIVE", label: "Executivo" },
];

export const JOB_POSITION_NATURE_LABELS: Record<string, string> = Object.fromEntries(
    JOB_POSITION_NATURE_ITEMS.map((item) => [item.value, item.label]),
);
