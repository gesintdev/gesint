import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const PERFORMANCE_RATING_ITEMS: SelectItem[] = [
    { value: "NEEDS_IMPROVEMENT", label: "Precisa melhorar" },
    { value: "MEETS", label: "Atende expectativas" },
    { value: "EXCEEDS", label: "Supera expectativas" },
    { value: "OUTSTANDING", label: "Excepcional" },
];

export const PERFORMANCE_RATING_LABELS: Record<string, string> = Object.fromEntries(
    PERFORMANCE_RATING_ITEMS.map((item) => [item.value, item.label]),
);
