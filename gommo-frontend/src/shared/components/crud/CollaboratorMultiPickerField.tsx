"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { collaboratorService } from "@/modules/rh/person/collaborators/people/services/collaborator.service";
import { InputAutocomplete } from "@/shared/components/ui/input/index";

type SelectedCollaborator = {
    id: string;
    label: string;
};

type CollaboratorMultiPickerFieldProps = {
    label?: string;
    hint?: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    error?: string;
    wrapperClassName?: string;
};

export function CollaboratorMultiPickerField({
    label = "Responsáveis",
    hint = "Somente colaboradores com admissão concluída",
    selectedIds,
    onChange,
    error,
    wrapperClassName,
}: CollaboratorMultiPickerFieldProps) {
    const [selected, setSelected] = useState<SelectedCollaborator[]>([]);
    const [loadingLabels, setLoadingLabels] = useState(false);

    useEffect(() => {
        const ids = selectedIds.filter(Boolean);
        if (ids.length === 0) {
            setSelected([]);
            return;
        }
        let cancelled = false;
        setLoadingLabels(true);
        void collaboratorService
            .getAdmitted()
            .then((collaborators) => {
                if (cancelled) return;
                const next = ids
                    .map((id) => {
                        const collaborator = collaborators.find((item) => item.id === id);
                        return collaborator ? { id, label: collaborator.fullName } : null;
                    })
                    .filter((item): item is SelectedCollaborator => item != null);
                setSelected(next);
            })
            .catch(() => {
                if (!cancelled) setSelected([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingLabels(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedIds]);

    const onSearch = useCallback(
        async (query: string, page: number) => {
            const result = await collaboratorService.searchForAutocomplete(query, page);
            const selectedSet = new Set(selectedIds);
            return {
                ...result,
                items: result.items.filter((item) => !selectedSet.has(item.value)),
            };
        },
        [selectedIds],
    );
    const addCollaborator = (collaboratorId: string) => {
        if (!collaboratorId || selectedIds.includes(collaboratorId)) return;
        onChange([...selectedIds, collaboratorId]);
    };
    const removeCollaborator = (collaboratorId: string) => {
        onChange(selectedIds.filter((id) => id !== collaboratorId));
    };

    return (
        <div className={clsx("grid gap-2", wrapperClassName)}>
            <InputAutocomplete
                label={label}
                hint={hint}
                value=""
                selectedLabel=""
                onValueChange={(value) => {
                    if (value) addCollaborator(value);
                }}
                onSearch={onSearch}
                placeholder="Pesquisar"
                error={error}
            />
            {loadingLabels ? (
                <div className="skeleton-shimmer h-10 w-full rounded-lg" />
            ) : selected.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                    {selected.map((item) => (
                        <li
                            key={item.id}
                            className="inline-flex max-w-full items-center gap-1 rounded-full border border-base-content/10 bg-base-200/60 px-2.5 py-1 text-sm text-base-content/85"
                        >
                            <span className="truncate">{item.label}</span>
                            <button
                                type="button"
                                className="rounded-full p-0.5 text-base-content/45 transition-colors hover:bg-base-content/10 hover:text-error"
                                aria-label={`Remover ${item.label}`}
                                onClick={() => removeCollaborator(item.id)}
                            >
                                <X className="size-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-base-content/45">Nenhum responsável selecionado.</p>
            )}
        </div>
    );
}
