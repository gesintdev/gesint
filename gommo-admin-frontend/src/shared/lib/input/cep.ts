import { digitsOnly } from "@/shared/lib/input/digits";

export function maskCep(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function isValidCep(value: string): boolean {
  return digitsOnly(value).length === 8;
}
