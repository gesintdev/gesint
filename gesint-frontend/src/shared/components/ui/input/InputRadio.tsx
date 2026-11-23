"use client";

import clsx from "clsx";
import type {ReactNode} from "react";

export type InputRadioProps = {
    name: string;
    label?: ReactNode;
    checked?: boolean;
    disabled?: boolean;
    isActive?: boolean;
    isUnavailable?: boolean;
    labelUnvailable?: string;
    onChange?: () => void;
};

export function InputRadio({
                               name,
                               label,
                               checked,
                               disabled,
                               isActive,
                               isUnavailable,
                               labelUnvailable,
                               onChange,
                           }: InputRadioProps) {
    return (
        <label
            className={clsx(
                "gesint-choice-option gesint-choice-option--multiline gesint-choice-option--outlined",
                isActive && "gesint-choice-option--active",
                isUnavailable && "gesint-choice-option--disabled gesint-disabled-surface",
            )}
        >
            <input
                type="radio"
                className="radio radio-sm"
                name={name}
                disabled={disabled || isUnavailable}
                checked={checked}
                onChange={onChange}
            />
            {label ? (
                <span className="flex min-w-0 flex-col justify-center">
                    <span className="gesint-choice-option__label">{label}</span>
                    {isUnavailable && labelUnvailable ? (
                        <span className="gesint-hint mt-0">{labelUnvailable}</span>
                    ) : null}
                </span>
            ) : null}
        </label>
    );
}
