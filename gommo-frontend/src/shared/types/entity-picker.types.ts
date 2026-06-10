import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import type { TableColumnConfig } from "@/shared/types/table.types";

export type EntityPickerFilterField = {
    id: string;
    label: string;
    placeholder?: string;
};

export type EntityPickerSearchParams = {
    page: number;
    size: number;
    filters: Record<string, string>;
};

export type EntityPickerAdvancedSearch<T extends object> = {
    title: string;
    filters: EntityPickerFilterField[];
    columns: TableColumnConfig[];
    search: (params: EntityPickerSearchParams) => Promise<PageableResponseDto<T>>;
    toSelectItem: (row: T) => SelectItem;
    pageSize?: number;
    emptyMessage?: string;
    selectHint?: string;
};
