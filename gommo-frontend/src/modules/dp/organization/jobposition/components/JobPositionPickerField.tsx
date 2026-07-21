import {useCallback} from "react";

import {
    JOB_POSITION_PICKER_ADVANCED,
    jobpositionService,
} from "@/modules/dp/organization/jobposition/services/jobposition.service";
import {EntityPickerField} from "@/shared/components/crud/EntityPickerField";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

export type JobPositionPickerSelection = {
    jobPositionId: string | null;
    title: string;
};

type JobPositionPickerCommonProps = {
    /** Quando informado, restringe cargos ao departamento */
    departmentId?: string;
    label?: string;
    hint?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    wrapperClassName?: string;
};

type JobPositionPickerStrictProps = JobPositionPickerCommonProps & {
    allowCustomTitle?: false;
    value: string;
    onValueChange: (id: string) => void;
};

type JobPositionPickerCustomProps = JobPositionPickerCommonProps & {
    allowCustomTitle: true;
    /** UUID do cargo selecionado ou título livre. */
    value: string;
    onValueChange: (selection: JobPositionPickerSelection) => void;
};

export type JobPositionPickerFieldProps = JobPositionPickerStrictProps | JobPositionPickerCustomProps;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function JobPositionPickerField(props: JobPositionPickerFieldProps) {
    const {
        value,
        departmentId,
        label = "Cargo",
        hint,
        required,
        error,
        disabled,
        wrapperClassName,
        allowCustomTitle = false,
    } = props;
    const onSearch = useCallback(
        (query: string, page: number) =>
            jobpositionService.searchForAutocomplete(query, page, departmentId?.trim() || undefined),
        [departmentId],
    );
    const resolveLabel = useCallback(async (id: string) => {
        const jobPosition = await jobpositionService.getById(id);
        return jobPosition.title;
    }, []);
    const handleValueChange = (next: string, item?: SelectItem) => {
        if (!allowCustomTitle) {
            (props as JobPositionPickerStrictProps).onValueChange(next);
            return;
        }
        const onSelectionChange = (props as JobPositionPickerCustomProps).onValueChange;
        if (!next.trim()) {
            onSelectionChange({jobPositionId: null, title: ""});
            return;
        }
        if (item) {
            onSelectionChange({jobPositionId: item.value, title: item.label});
            return;
        }
        if (isUuid(next)) {
            onSelectionChange({jobPositionId: next, title: next});
            return;
        }
        onSelectionChange({jobPositionId: null, title: next.trim()});
    };

    return (
        <EntityPickerField
            label={label}
            hint={
                hint ??
                (allowCustomTitle
                    ? "Selecione um cargo cadastrado ou digite um nome livre."
                    : undefined)
            }
            value={value ?? ""}
            onValueChange={handleValueChange}
            onSearch={onSearch}
            resolveLabel={resolveLabel}
            placeholder="Digite o título do cargo…"
            required={required}
            error={error}
            disabled={disabled}
            wrapperClassName={wrapperClassName}
            advancedSearch={JOB_POSITION_PICKER_ADVANCED}
            allowCustomValue={allowCustomTitle}
        />
    );
}
