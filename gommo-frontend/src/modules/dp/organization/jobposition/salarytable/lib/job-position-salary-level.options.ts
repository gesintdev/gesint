import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const JOB_POSITION_SALARY_LEVEL_ITEMS: SelectItem[] = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
];

export const JOB_POSITION_SALARY_LEVEL_LABELS: Record<string, string> = Object.fromEntries(
    JOB_POSITION_SALARY_LEVEL_ITEMS.map((item) => [item.value, item.label]),
);

export const ALL_SALARY_LEVELS = ["I", "II", "III"] as const;
