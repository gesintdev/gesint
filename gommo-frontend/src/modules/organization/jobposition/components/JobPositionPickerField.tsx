"use client";

import { useCallback } from "react";
import { EntityPickerField } from "@/shared/components/crud/EntityPickerField";
import {
    JOB_POSITION_PICKER_ADVANCED,
    jobpositionService,
} from "@/modules/organization/jobposition/services/jobposition.service";

type JobPositionPickerFieldProps = {
    value: string;
    onValueChange: (id: string) => void;
    /** Quando informado, restringe cargos ao departamento */
    departmentId?: string;
    label?: string;
    hint?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    wrapperClassName?: string;
};

export function JobPositionPickerField({
    value,
    onValueChange,
    departmentId,
    label = "Cargo",
    hint,
    required,
    error,
    disabled,
    wrapperClassName,
}: JobPositionPickerFieldProps) {
    const onSearch = useCallback(
        (query: string, page: number) =>
            jobpositionService.searchForAutocomplete(query, page, departmentId?.trim() || undefined),
        [departmentId],
    );

    const resolveLabel = useCallback(async (id: string) => {
        const jobPosition = await jobpositionService.getById(id);
        return jobPosition.title;
    }, []);

    return (
        <EntityPickerField
            label={label}
            hint={hint}
            value={value ?? ""}
            onValueChange={(id) => onValueChange(id)}
            onSearch={onSearch}
            resolveLabel={resolveLabel}
            placeholder="Digite o título do cargo…"
            required={required}
            error={error}
            disabled={disabled}
            wrapperClassName={wrapperClassName}
            advancedSearch={JOB_POSITION_PICKER_ADVANCED}
        />
    );
}
