import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const OBLIGATION_TYPE_ITEMS: SelectItem[] = [
    { value: "IRRF", label: "IRRF" },
    { value: "INSS", label: "INSS" },
    { value: "FGTS", label: "FGTS" },
    { value: "OTHER", label: "Outro" },
];

export const OBLIGATION_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    OBLIGATION_TYPE_ITEMS.map((item) => [item.value, item.label]),
);
