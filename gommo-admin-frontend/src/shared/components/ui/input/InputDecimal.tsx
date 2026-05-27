"use client";

import { maskDecimal, unmaskDecimal } from "@/shared/lib/input/decimal";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";

export type InputDecimalProps = InputFieldChromeProps & {
  value: string;
  onValueChange: (decimal: string) => void;
  maxDecimals?: number;
};

export function InputDecimal({
  value,
  onValueChange,
  maxDecimals = 4,
  ...chrome
}: InputDecimalProps) {
  return (
    <InputBase
      {...chrome}
      displayValue={maskDecimal(value.replace(".", ","), maxDecimals)}
      inputMode="decimal"
      placeholder="0,00"
      onDisplayChange={(next) => onValueChange(unmaskDecimal(maskDecimal(next, maxDecimals)))}
      hint={chrome.hint ?? "Retorno sem máscara (ponto decimal)"}
    />
  );
}
