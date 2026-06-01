"use client";

import clsx from "clsx";

type EntityCodeFieldProps = {
    code?: number | null;
    moduleName?: string;
    /** Apenas #código, sem nome do módulo (toolbar do stepper). */
    codeOnly?: boolean;
    className?: string;
};

/** Exibe o código sequencial do registro (somente leitura, em telas de edição). */
export function EntityCodeField({code, moduleName, codeOnly = false, className}: EntityCodeFieldProps) {
    if (code == null) return null;

    if (codeOnly) {
        return (
            <span className={clsx("form-stepper__code-value tabular-nums", className)}>
                #{code}
            </span>
        );
    }

    return (
        <div className={clsx("text-md text-secondary", className)}>
            {moduleName ? <p className="font-semibold">{moduleName} #{code}</p> :
                <p className="font-semibold">#{code}</p>}
        </div>
    );
}
