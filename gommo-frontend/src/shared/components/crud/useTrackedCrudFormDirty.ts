"use client";

import { useCrudFormDirty } from "@/shared/components/crud/useCrudFormDirty";
import { useFormDirtyByComparison } from "@/shared/components/crud/useFormDirtyByComparison";

type UseTrackedCrudFormDirtyOptions<TForm, TDetail> = {
    form: TForm;
    isEditing: boolean;
    detailData: TDetail | null | undefined;
    toFormDto: (detail: TDetail) => TForm;
    getEmptyForm: () => TForm;
};

/** Registra alterações não salvas comparando o formulário com a baseline (vazio ou registro carregado). */
export function useTrackedCrudFormDirty<TForm, TDetail>({
    form,
    isEditing,
    detailData,
    toFormDto,
    getEmptyForm,
}: UseTrackedCrudFormDirtyOptions<TForm, TDetail>): void {
    const baseline = isEditing && detailData != null ? toFormDto(detailData) : getEmptyForm();
    const isDirty = useFormDirtyByComparison(form, baseline);
    useCrudFormDirty(isDirty);
}
