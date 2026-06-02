"use client";

import {useCallback, useEffect, useState} from "react";
import {collaboratorService} from "@/modules/person/collaborators/people/services/collaborator.service";
import {InputAutocomplete} from "@/shared/components/ui/input/index";

type CollaboratorPickerFieldProps = {
    label?: string;
    hint?: string;
    value: string;
    onValueChange: (collaboratorId: string) => void;
    required?: boolean;
    error?: string;
    wrapperClassName?: string;
};

export function CollaboratorPickerField({
                                            label = "Colaborador",
                                            hint = "Somente colaboradores com admissão concluída",
                                            value,
                                            onValueChange,
                                            required,
                                            error,
                                            wrapperClassName,
                                        }: CollaboratorPickerFieldProps) {
    const [selectedLabel, setSelectedLabel] = useState("");

    useEffect(() => {
        const id = value?.trim();
        if (!id) {
            setSelectedLabel("");
            return;
        }

        let cancelled = false;
        void collaboratorService
            .getById(id)
            .then((c) => {
                if (!cancelled) setSelectedLabel(c.fullName);
            })
            .catch(() => {
                if (!cancelled) setSelectedLabel("");
            });

        return () => {
            cancelled = true;
        };
    }, [value]);

    const onSearch = useCallback(
        (query: string, page: number) => collaboratorService.searchForAutocomplete(query, page),
        [],
    );

    return (
        <InputAutocomplete
            label={label}
            hint={hint}
            value={value ?? ""}
            selectedLabel={selectedLabel}
            onValueChange={(v, item) => {
                onValueChange(v);
                setSelectedLabel(item?.label ?? "");
            }}
            onSearch={onSearch}
            placeholder="Digite nome ou CPF…"
            autoComplete="off"
            required={required}
            error={error}
            wrapperClassName={wrapperClassName}
        />
    );
}
