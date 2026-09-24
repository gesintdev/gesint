"use client";

import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";

import type {DocumentTypeContext} from "@/modules/cfg/settings/documenttype/dto/document-type.dto";
import {documentTypeKeys} from "@/modules/cfg/settings/documenttype/documenttype.query";
import {DOCUMENT_DATA_CLASS_LABELS} from "@/modules/cfg/settings/documenttype/lib/document-type.options";
import {documentTypeService} from "@/modules/cfg/settings/documenttype/services/document-type.service";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

export type DocumentTypeSelectItem = SelectItem & {
    dataClass?: string;
    dataClassLabel?: string;
};

export function useDocumentTypeItems(context: DocumentTypeContext | null | undefined) {
    const query = useQuery({
        queryKey: documentTypeKeys.byContext(context ?? ""),
        queryFn: () => documentTypeService.listByContext(context!),
        enabled: Boolean(context),
        staleTime: 60_000,
    });

    const items = useMemo<DocumentTypeSelectItem[]>(() => {
        return (query.data ?? []).map((row) => ({
            value: row.typeCode,
            label: row.name,
            dataClass: row.dataClass,
            dataClassLabel: DOCUMENT_DATA_CLASS_LABELS[row.dataClass] ?? row.dataClass,
        }));
    }, [query.data]);

    const labelByCode = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of items) {
            map.set(item.value, item.label);
        }
        return map;
    }, [items]);

    const classLabelByCode = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of items) {
            if (item.dataClassLabel) map.set(item.value, item.dataClassLabel);
        }
        return map;
    }, [items]);

    return {
        items,
        labelByCode,
        classLabelByCode,
        isLoading: query.isLoading,
        isError: query.isError,
    };
}

export function documentTypeLabel(
    value: string | null | undefined,
    items?: DocumentTypeSelectItem[] | SelectItem[] | null,
): string {
    if (!value) return "—";
    const found = items?.find((item) => item.value === value);
    return found?.label ?? value;
}

export function documentTypeClassLabel(
    value: string | null | undefined,
    items?: DocumentTypeSelectItem[] | null,
): string {
    if (!value) return "—";
    const found = items?.find((item) => item.value === value);
    return found?.dataClassLabel ?? "—";
}
