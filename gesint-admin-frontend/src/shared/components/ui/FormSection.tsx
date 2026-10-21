"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type FormSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
};

export function FormSection({ title, description, children, className, bodyClassName }: FormSectionProps) {
    return (
        <section className={clsx("gesint-form-section sm:col-span-2", className)}>
            <header className="gesint-form-section__header">
                <h3 className="gesint-form-section__title">{title}</h3>
                {description ? <p className="gesint-form-section__description">{description}</p> : null}
            </header>
            <div className={clsx("gesint-form-section__body", bodyClassName)}>{children}</div>
        </section>
    );
}
