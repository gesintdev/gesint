import clsx from "clsx";
import type { ReactNode, SubmitEvent } from "react";

type CrudFormShellProps = {
    children: ReactNode;
    footer: ReactNode;
    onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
    className?: string;
    bodyClassName?: string;
    formId?: string;
};

/**
 * Formulário CRUD com área rolável e rodapé de ações fixo na base do painel.
 */
export function CrudFormShell({
    children,
    footer,
    onSubmit,
    className,
    bodyClassName,
    formId,
}: CrudFormShellProps) {
    return (
        <form
            id={formId}
            onSubmit={onSubmit}
            className={clsx("crud-form-shell", className)}
        >
            <div className={clsx("crud-form-shell__body", bodyClassName)}>{children}</div>
            <div className="crud-form-shell__footer">
                <div className="crud-form-shell__actions">{footer}</div>
            </div>
        </form>
    );
}
