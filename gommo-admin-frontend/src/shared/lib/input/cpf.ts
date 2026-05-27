import { digitsOnly } from "@/shared/lib/input/digits";

export function maskCpf(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function checkDigit(digits: number[], factor: number): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (factor - i);
  }
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
}

export function isValidCpf(value: string): boolean {
  const d = digitsOnly(value);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const nums = d.split("").map(Number);
  const d1 = checkDigit(nums.slice(0, 9), 10);
  const d2 = checkDigit(nums.slice(0, 10), 11);
  return d1 === nums[9] && d2 === nums[10];
}
