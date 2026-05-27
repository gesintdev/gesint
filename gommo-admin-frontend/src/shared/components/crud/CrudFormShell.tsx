"use client";

import clsx from "clsx";
import type { FormEvent, ReactNode } from "react";

export type CrudFormShellProps = {
    /** Campos do formulário (sem `<form>` interno — o shell é o único form). */
    children: ReactNode;
    footer: ReactNode;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    /** Opcional — título acima da área rolável (evita título dentro do grid repetido). */
    title?: string;
    /** Erro de salvamento ou validação da API — exibido no corpo rolável. */
    error?: string | null;
    className?: string;
    /** Classes extras no container rolável principal (abaixo do título). */
    bodyClassName?: string;
    formId?: string;
};

/**
 * Formulário CRUD com uma única tag `<form>`, área rolável e rodapé de ações fixo.
 */
export function CrudFormShell({
    children,
    footer,
    onSubmit,
    title,
    error,
    className,
    bodyClassName,
    formId,
}: CrudFormShellProps) {
    return (
        <form id={formId} onSubmit={onSubmit} className={clsx("crud-form-shell", className)}>
            <div className={clsx("crud-form-shell__body", bodyClassName)}>
                {title ? (
                    <header className="crud-form-shell__head">
                        <h2 className="text-base font-semibold tracking-tight text-base-content">{title}</h2>
                    </header>
                ) : null}
                <div className="crud-form-shell__fields gommo-crud-panel-inset">
                    {error ? (
                        <p className="text-sm font-medium text-error" role="alert">
                            {error}
                        </p>
                    ) : null}
                    {children}
                </div>
            </div>
            <div className="crud-form-shell__footer gommo-crud-footer-inset">
                <div className="crud-form-shell__actions">{footer}</div>
            </div>
        </form>
    );
}
