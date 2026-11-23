import clsx from "clsx";
import type { ReactNode, SubmitEvent } from "react";

type CrudFormShellProps = {
    children: ReactNode;
    /** Ações do cadastro, na mesma faixa da toolbar da listagem. */
    footer: ReactNode;
    onSubmit: (_event: SubmitEvent<HTMLFormElement>) => void;
    className?: string;
    bodyClassName?: string;
    formId?: string;
};

export function CrudFormShell({
    children,
    footer,
    onSubmit,
    className,
    bodyClassName,
    formId,
}: CrudFormShellProps) {
    return (
        <form id={formId} onSubmit={onSubmit} className={clsx("crud-form-shell", className)}>
            <div className="crud-list-toolbar flex flex-wrap items-center justify-end gap-2 border-b px-4 py-1.5">
                <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
            </div>
            <div className={clsx("crud-form-shell__body", bodyClassName)}>{children}</div>
        </form>
    );
}
