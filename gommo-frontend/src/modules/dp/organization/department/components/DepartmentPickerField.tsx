import { useCallback } from "react";

import {
    DEPARTMENT_PICKER_ADVANCED,
    departmentService,
} from "@/modules/dp/organization/department/services/department.service";
import { EntityPickerField } from "@/shared/components/crud/EntityPickerField";

type DepartmentPickerFieldProps = {
    value: string;
    onValueChange: (id: string) => void;
    label?: string;
    hint?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    wrapperClassName?: string;
};

export function DepartmentPickerField({
    value,
    onValueChange,
    label = "Departamento",
    hint,
    required,
    error,
    disabled,
    wrapperClassName,
}: DepartmentPickerFieldProps) {
    const onSearch = useCallback(
        (query: string, page: number) => departmentService.searchForAutocomplete(query, page),
        [],
    );
    const resolveLabel = useCallback(async (id: string) => {
        const department = await departmentService.getById(id);
        return department.name;
    }, []);

    return (
        <EntityPickerField
            label={label}
            hint={hint}
            value={value ?? ""}
            onValueChange={(id) => onValueChange(id)}
            onSearch={onSearch}
            resolveLabel={resolveLabel}
            placeholder="Digite o nome do departamento…"
            required={required}
            error={error}
            disabled={disabled}
            wrapperClassName={wrapperClassName}
            advancedSearch={DEPARTMENT_PICKER_ADVANCED}
        />
    );
}
