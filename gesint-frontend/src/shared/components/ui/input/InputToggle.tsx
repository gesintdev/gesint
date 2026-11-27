"use client";

import clsx from "clsx";
import { type ReactNode, useId } from "react";

export type InputToggleProps = {
    checked: boolean;
    onCheckedChange: (_checked: boolean) => void;
    /** Nome da opção. */
    label: ReactNode;
    /** Uma frase com a consequência de ligar a opção (o que muda para quem usa). */
    description?: ReactNode;
    disabled?: boolean;
    className?: string;
    /** Conteúdo extra que só aparece com a opção ligada (ex.: campo dependente). */
    children?: ReactNode;
};

/**
 * Opção liga/desliga com a consequência escrita embaixo. Usado em preferências: a regra do produto
 * é que toda opção tenha uma frase dizendo o que ela faz.
 */
export function InputToggle({
    checked,
    onCheckedChange,
    label,
    description,
    disabled = false,
    className,
    children,
}: InputToggleProps) {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;
    return (
        <div
            className={clsx("gesint-toggle-row", disabled && "gesint-disabled-surface", className)}
            data-checked={checked || undefined}
        >
            <label htmlFor={id} className="gesint-toggle-row__main">
                <span className="gesint-toggle-row__text">
                    <span className="gesint-toggle-row__label">{label}</span>
                    {description ? (
                        <span id={descriptionId} className="gesint-toggle-row__description">
                            {description}
                        </span>
                    ) : null}
                </span>
                <input
                    id={id}
                    type="checkbox"
                    role="switch"
                    className="gesint-toggle"
                    checked={checked}
                    disabled={disabled}
                    aria-describedby={descriptionId}
                    onChange={(event) => onCheckedChange(event.target.checked)}
                />
            </label>
            {checked && children ? <div className="gesint-toggle-row__extra">{children}</div> : null}
        </div>
    );
}
