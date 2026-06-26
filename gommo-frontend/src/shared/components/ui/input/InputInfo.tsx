"use client";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";

export type InputInfoProps = Omit<InputFieldChromeProps, "disabled" | "readOnly"> & {
    value: string;
    placeholder?: string;
};

export function InputInfo({ value, placeholder, ...chrome }: InputInfoProps) {
    return (
        <InputBase
            {...chrome}
            displayValue={value}
            placeholder={placeholder}
            readOnly
            className="cursor-text"
            inputClassName="cursor-text select-text"
            onDisplayChange={() => undefined}
        />
    );
}
