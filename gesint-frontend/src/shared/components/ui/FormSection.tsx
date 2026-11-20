"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type FormSectionProps = {
    id?: string;
    title?: string;
    /** Reservado — descrição da sessão está oculta por enquanto. */
    description?: string;
    /** Conteúdo à direita do título no header (ex.: botão +). */
    headerActions?: ReactNode;
    /** Desabilita interação na sessão (ex.: cargo ainda não salvo). */
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
};

export function FormSection({
    id,
    title,
    description: _description,
    headerActions,
    disabled = false,
    children,
    className,
    bodyClassName,
}: FormSectionProps) {
    return (
        <section
            id={id}
            aria-disabled={disabled || undefined}
            className={clsx(
                "gesint-form-section sm:col-span-2",
                disabled && "gesint-disabled-surface",
                className,
            )}
        >
            {title ? (
                <header className="gesint-form-section__header">
                    <div className="gesint-form-section__header-main">
                        <h3 className="gesint-form-section__title">{title}</h3>
                    </div>
                    {headerActions && !disabled ? (
                        <div className="gesint-form-section__header-actions">{headerActions}</div>
                    ) : null}
                </header>
            ) : null}
            <div className={clsx("gesint-form-section__body", bodyClassName)}>{children}</div>
        </section>
    );
}
