"use client";

import { useState } from "react";
import { isValidCpf, maskCpf } from "@/shared/lib/input/cpf";
import { digitsOnly } from "@/shared/lib/input/digits";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";

export type InputCPFProps = InputFieldChromeProps & {
  value: string;
  onValueChange: (cpf: string) => void;
  validate?: boolean;
  placeholder?: string;
};

export function InputCPF({ value, onValueChange, validate = true, ...chrome }: InputCPFProps) {
  const [localError, setLocalError] = useState<string | undefined>();

  const handleBlur = () => {
    if (!validate || !value) {
      setLocalError(undefined);
      return;
    }
    setLocalError(isValidCpf(value) ? undefined : "CPF inválido");
  };

  return (
    <InputBase
      {...chrome}
      error={chrome.error ?? localError}
      displayValue={maskCpf(value)}
      inputMode="numeric"
      placeholder={chrome.placeholder ?? "000.000.000-00"}
      maxLength={14}
      onDisplayChange={(next) => onValueChange(digitsOnly(next).slice(0, 11))}
      onBlur={handleBlur}
    />
  );
}
