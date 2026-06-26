"use client";
import clsx from "clsx";
import type { ReactNode } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import {
    defaultNumberPlaceholder,
    maskNumber,
    type MaskNumberOptions,
    numberMaskOptions,
    numberToMaskInput,
    unmaskedStringToNumber,
    unmaskNumber,
} from "@/shared/lib/input/number";

export type InputNumberAlign = "left" | "right";

export interface InputNumberProps extends InputFieldChromeProps {
    value: number | null | undefined;
    onValueChange: (value: number | null) => void;
    integer?: boolean;
    decimalPlaces?: number;
    thousandSeparator?: boolean;
    prefix?: string;
    suffix?: string;
    align?: InputNumberAlign;
    placeholder?: string;
    leftIcon?: ReactNode;
    rightSlot?: ReactNode;
}

function numberAdornment(value: string | undefined) {
    if (!value) return undefined;
    return <span className="shrink-0 select-none text-base-content/55">{value}</span>;
}

export function InputNumber({
    value,
    onValueChange,
    integer = false,
    decimalPlaces = 2,
    thousandSeparator = false,
    prefix,
    suffix,
    align = "right",
    placeholder,
    leftIcon,
    rightSlot,
    label,
    hint,
    error,
    required,
    disabled,
    readOnly,
    wrapperClassName,
    id,
    labelFor,
}: InputNumberProps) {
    const maskOpts: MaskNumberOptions = numberMaskOptions({ integer, decimalPlaces, thousandSeparator });
    const toDisplay = (num: number | null | undefined) =>
        maskNumber(numberToMaskInput(num, maskOpts).replace(".", ","), maskOpts);

    return (
        <InputBase
            label={label}
            hint={hint}
            error={error}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            wrapperClassName={wrapperClassName}
            id={id}
            labelFor={labelFor}
            leftIcon={leftIcon ?? numberAdornment(prefix)}
            rightSlot={rightSlot ?? numberAdornment(suffix)}
            displayValue={toDisplay(value)}
            inputMode={integer ? "numeric" : "decimal"}
            placeholder={placeholder ?? defaultNumberPlaceholder(maskOpts)}
            inputClassName={clsx(align === "right" ? "text-right" : "text-left")}
            onDisplayChange={(next) => {
                const unmasked = unmaskNumber(maskNumber(next, maskOpts));
                onValueChange(unmaskedStringToNumber(unmasked, integer));
            }}
        />
    );
}
