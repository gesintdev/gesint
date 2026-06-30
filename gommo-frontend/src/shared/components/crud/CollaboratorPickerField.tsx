import { useCallback } from "react";

import {
    COLLABORATOR_PICKER_ADVANCED,
    collaboratorService,
} from "@/modules/rh/person/collaborators/people/services/collaborator.service";
import { EntityPickerField } from "@/shared/components/crud/EntityPickerField";

type CollaboratorPickerFieldProps = {
    value: string;
    onValueChange: (collaboratorId: string) => void;
    label?: string;
    hint?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    wrapperClassName?: string;
};

export function CollaboratorPickerField({
    value,
    onValueChange,
    label = "Colaborador",
    hint = "Somente colaboradores com admissão concluída",
    required,
    error,
    disabled,
    wrapperClassName,
}: CollaboratorPickerFieldProps) {
    const onSearch = useCallback(
        (query: string, page: number) => collaboratorService.searchForAutocomplete(query, page),
        [],
    );
    const resolveLabel = useCallback(async (id: string) => {
        const collaborator = await collaboratorService.getById(id);
        return collaborator.fullName;
    }, []);

    return (
        <EntityPickerField
            label={label}
            hint={hint}
            value={value ?? ""}
            onValueChange={(id) => onValueChange(id)}
            onSearch={onSearch}
            resolveLabel={resolveLabel}
            placeholder="Digite nome ou CPF..."
            required={required}
            error={error}
            disabled={disabled}
            wrapperClassName={wrapperClassName}
            advancedSearch={COLLABORATOR_PICKER_ADVANCED}
        />
    );
}
