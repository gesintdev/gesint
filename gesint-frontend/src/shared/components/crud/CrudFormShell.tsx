import clsx from "clsx";
import type { ReactNode, SubmitEvent } from "react";

import { type FormStepNavItem, FormStepper } from "@/shared/components/ui/FormStepper";

export type CrudFormStepperConfig = {
    steps: FormStepNavItem[];
    filledStepIds?: readonly string[];
    entityCode?: number | null;
    resetKey?: string | null;
};

type CrudFormShellProps = {
    children: ReactNode;
    footer: ReactNode;
    onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
    className?: string;
    bodyClassName?: string;
    formId?: string;
    stepper?: CrudFormStepperConfig;
};

export function CrudFormShell({
    children,
    footer,
    onSubmit,
    className,
    bodyClassName,
    formId,
    stepper,
}: CrudFormShellProps) {
    const bodyContent = stepper ? (
        <FormStepper
            key={stepper.resetKey ?? "new"}
            steps={stepper.steps}
            filledStepIds={stepper.filledStepIds}
            entityCode={stepper.entityCode}
        >
            {children}
        </FormStepper>
    ) : (
        children
    );

    return (
        <form id={formId} onSubmit={onSubmit} className={clsx("crud-form-shell", className)}>
            <div className={clsx("crud-form-shell__body", stepper && "overflow-hidden! p-0!", bodyClassName)}>
                {bodyContent}
            </div>
            <div className="crud-form-shell__footer">
                <div className="crud-form-shell__actions">{footer}</div>
            </div>
        </form>
    );
}
