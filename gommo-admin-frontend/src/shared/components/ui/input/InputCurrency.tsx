"use client";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import { centsToDecimal, maskCurrencyFromCents, parseCurrencyToCents } from "@/shared/lib/input/currency";

export type InputCurrencyProps = InputFieldChromeProps & {
    /** Centavos como string ("12345" = R$ 123,45) */
    value: string;
    onValueChange: (cents: string) => void;
    /** Se true, onValueChange em decimal "123.45" em vez de centavos */
    emitAsDecimal?: boolean;
};

export function InputCurrency({ value, onValueChange, emitAsDecimal = false, ...chrome }: InputCurrencyProps) {
    return (
        <InputBase
            {...chrome}
            displayValue={maskCurrencyFromCents(value)}
            inputMode="numeric"
            placeholder="R$ 0,00"
            onDisplayChange={(next) => {
                const cents = parseCurrencyToCents(next);
                onValueChange(emitAsDecimal ? centsToDecimal(cents) : cents);
            }}
            hint={chrome.hint ?? (emitAsDecimal ? "Retorno: decimal" : "Retorno: centavos (string)")}
        />
    );
}
