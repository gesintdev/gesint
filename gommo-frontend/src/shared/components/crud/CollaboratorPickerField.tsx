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
    managersOnly?: boolean;
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
    managersOnly,
}: CollaboratorPickerFieldProps) {
    const onSearch = useCallback(
        (query: string, page: number) =>
            managersOnly
                ? collaboratorService.searchManagersForAutocomplete(query, page)
                : collaboratorService.searchForAutocomplete(query, page),
        [managersOnly],
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
            advancedSearch={
                managersOnly
                    ? {
                          ...COLLABORATOR_PICKER_ADVANCED,
                          title: "Buscar gestor",
                          search: (params) => collaboratorService.searchManagersForPicker(params),
                          emptyMessage: "Nenhum gestor encontrado.",
                      }
                    : COLLABORATOR_PICKER_ADVANCED
            }
        />
    );
}
