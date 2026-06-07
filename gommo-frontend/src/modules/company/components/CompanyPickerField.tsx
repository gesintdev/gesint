"use client";

import { useCallback } from "react";
import { EntityPickerField } from "@/shared/components/crud/EntityPickerField";
import {
    COMPANY_PICKER_ADVANCED,
    companyService,
} from "@/modules/company/services/company.service";

type CompanyPickerFieldProps = {
    value?: string;
    onValueChange: (value: string) => void;
    label?: string;
    hint?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    wrapperClassName?: string;
};

export function CompanyPickerField({
    value,
    onValueChange,
    label = "Empresa",
    hint,
    required,
    error,
    disabled,
    wrapperClassName,
}: CompanyPickerFieldProps) {
    const onSearch = useCallback(
        (query: string, page: number) => companyService.searchForAutocomplete(query, page),
        [],
    );

    const resolveLabel = useCallback(async (id: string) => {
        const company = await companyService.getById(id);
        return company.legalName;
    }, []);

    return (
        <EntityPickerField
            label={label}
            hint={hint}
            value={value ?? ""}
            onValueChange={(id) => onValueChange(id)}
            onSearch={onSearch}
            resolveLabel={resolveLabel}
            placeholder="Digite razão social ou CNPJ…"
            required={required}
            error={error}
            disabled={disabled}
            wrapperClassName={wrapperClassName}
            advancedSearch={COMPANY_PICKER_ADVANCED}
        />
    );
}
