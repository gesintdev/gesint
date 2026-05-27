import { lettersAndDigits } from "@/shared/lib/input/digits";

export function maskRg(value: string): string {
  const raw = lettersAndDigits(value).slice(0, 12).toUpperCase();
  if (raw.length <= 2) return raw;
  if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
  if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}-${raw.slice(8)}`;
}

export function unmaskRg(value: string): string {
  return lettersAndDigits(value).toUpperCase();
}

export function isValidRg(value: string): boolean {
  const len = unmaskRg(value).length;
  return len >= 4 && len <= 12;
}
