import clsx from "clsx";
import type { ReactNode, SubmitEvent } from "react";
import {LineContainer} from "@/shared/components/ui/line-container/LineContainer";

type CrudFormShellProps = {
    children: ReactNode;
    /** Ações do cadastro, na mesma faixa da toolbar da listagem. */
    header: ReactNode;
    onSubmit: (_event: SubmitEvent<HTMLFormElement>) => void;
    className?: string;
    bodyClassName?: string;
    formId?: string;
};

export function CrudFormShell({
    children,
    header,
    onSubmit,
    className,
    bodyClassName,
    formId,
}: CrudFormShellProps) {
    return (
        <form id={formId} onSubmit={onSubmit} className={clsx("crud-form-shell", className)}>
            <div className="crud-list-toolbar flex flex-wrap items-center justify-end gap-2 border-b px-4 py-1.5">
                <LineContainer>{header}</LineContainer>
            </div>
            <div className={clsx("crud-form-shell__body", bodyClassName)}>{children}</div>
        </form>
    );
}
