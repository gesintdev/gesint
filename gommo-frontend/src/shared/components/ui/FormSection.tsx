"use client";

import clsx from "clsx";
import type {ReactNode} from "react";

type FormSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
};

/** Bloco de formulário com fundo e borda suaves (estilo Stripe/Linear). */
export function FormSection({
                                title,
                                description,
                                children,
                                className,
                                bodyClassName,
                            }: FormSectionProps) {
    return (
        <section className={clsx("gommo-form-section sm:col-span-2", className)}>
            <header className="gommo-form-section__header">
                <h3 className="gommo-form-section__title">{title}</h3>
                {description ? (
                    <p className="gommo-form-section__description">{description}</p>
                ) : null}
            </header>
            <div className={clsx("gommo-form-section__body", bodyClassName)}>{children}</div>
        </section>
    );
}
