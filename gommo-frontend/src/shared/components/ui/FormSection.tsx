"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type FormSectionProps = {
    id?: string;
    title?: string;
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
    description,
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
                "gommo-form-section sm:col-span-2",
                disabled && "gommo-disabled-surface",
                className,
            )}
        >
            {title ? (
                <header className="gommo-form-section__header">
                    <div className="gommo-form-section__header-main">
                        <h3 className="gommo-form-section__title">{title}</h3>
                        {description ? <p className="gommo-form-section__description">{description}</p> : null}
                    </div>
                    {headerActions && !disabled ? (
                        <div className="gommo-form-section__header-actions">{headerActions}</div>
                    ) : null}
                </header>
            ) : null}
            <div className={clsx("gommo-form-section__body", bodyClassName)}>{children}</div>
        </section>
    );
}
