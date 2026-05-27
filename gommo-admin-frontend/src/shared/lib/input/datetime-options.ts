import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const DATETIME_HOUR_ITEMS: SelectItem[] = Array.from({ length: 24 }, (_, i) => {
  const value = String(i).padStart(2, "0");
  return { value, label: value };
});

/** Minutos de 01 a 60 (conforme regra do produto) */
export const DATETIME_MINUTE_ITEMS: SelectItem[] = Array.from({ length: 60 }, (_, i) => {
  const value = String(i + 1).padStart(2, "0");
  return { value, label: value };
});
