"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {type SubmitEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import type {
    DocumentDataClass,
    DocumentType,
    DocumentTypeRequestDto,
} from "@/modules/cfg/settings/documenttype/dto/document-type.dto";
import {documentTypeKeys} from "@/modules/cfg/settings/documenttype/documenttype.query";
import {
    DOCUMENT_DATA_CLASS_ITEMS,
    DOCUMENT_TYPE_CONTEXT_ITEMS,
} from "@/modules/cfg/settings/documenttype/lib/document-type.options";
import {documentTypeService} from "@/modules/cfg/settings/documenttype/services/document-type.service";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputCheckbox, InputNumber, InputSelect, InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{id: "cadastro", label: "Tipo de documento"}];

function emptyForm(): DocumentTypeRequestDto {
    return {
        typeCode: "",
        name: "",
        description: "",
        dataClass: "COMUM",
        contexts: [],
        sortOrder: 0,
    };
}

function toFormDto(detail: DocumentType): DocumentTypeRequestDto {
    return {
        typeCode: detail.typeCode ?? "",
        name: detail.name ?? "",
        description: detail.description ?? "",
        dataClass: detail.dataClass ?? "COMUM",
        contexts: detail.contexts ?? [],
        sortOrder: detail.sortOrder ?? 0,
    };
}

export function DocumentTypeFormClient() {
    const {editingId, isEditing, goToList, startCreate, showSavedRecord} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<DocumentTypeRequestDto>(emptyForm);
    const [systemManaged, setSystemManaged] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: documentTypeKeys.detail(editingId ?? ""),
        queryFn: () => documentTypeService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyForm());
            setSystemManaged(false);
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(toFormDto(detailQuery.data));
            setSystemManaged(Boolean(detailQuery.data.systemManaged));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto,
        getEmptyForm: emptyForm,
    });

    const saveMutation = useMutation({
        mutationFn: async (dto: DocumentTypeRequestDto) => {
            const payload: DocumentTypeRequestDto = {
                typeCode: dto.typeCode.trim().toUpperCase().replace(/\s+/g, "_"),
                name: dto.name.trim(),
                description: dto.description?.trim() || undefined,
                dataClass: dto.dataClass,
                contexts: dto.contexts,
                sortOrder: dto.sortOrder ?? 0,
            };
            if (isEditing && editingId) return documentTypeService.update(editingId, payload);
            return documentTypeService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({queryKey: documentTypeKeys.all});
            if (editingId) {
                await queryClient.invalidateQueries({queryKey: documentTypeKeys.detail(editingId)});
            }
            toast.success(isEditing ? "Tipo de documento atualizado" : "Tipo de documento cadastrado");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar o tipo de documento.",
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof DocumentTypeRequestDto>(field: K, value: DocumentTypeRequestDto[K]) =>
        setForm((prev) => ({...prev, [field]: value}));

    const toggleContext = (context: string, checked: boolean) => {
        setForm((prev) => {
            const current = prev.contexts ?? [];
            const next = checked
                ? current.includes(context)
                    ? current
                    : [...current, context]
                : current.filter((item) => item !== context);
            return {...prev, contexts: next};
        });
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (!form.typeCode.trim() || !form.name.trim()) {
            setError("Informe código e nome.");
            return;
        }
        if (!form.contexts.length) {
            setError("Selecione ao menos um contexto de uso.");
            return;
        }
        saveMutation.mutate(form);
    };

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="cadastro"
                title="Tipo de documento"
                description="A classe (RN-02) define a proteção do anexo no download (SEG-01)."
            >
                <InputString
                    label="Código"
                    value={form.typeCode}
                    onValueChange={(v) => update("typeCode", v)}
                    required
                    disabled={systemManaged}
                    hint={systemManaged ? "Código protegido (tipo do sistema)." : "Ex.: ATESTADO, RG"}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Nome"
                    value={form.name}
                    onValueChange={(v) => update("name", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Classe do dado"
                    items={DOCUMENT_DATA_CLASS_ITEMS}
                    value={form.dataClass}
                    onValueChange={(v) => update("dataClass", v as DocumentDataClass)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputNumber
                    label="Ordem"
                    value={form.sortOrder ?? 0}
                    onValueChange={(v) => update("sortOrder", v ?? 0)}
                    integer
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => update("description", v)}
                    wrapperClassName="sm:col-span-12"
                />
                <div className="sm:col-span-12 mt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-base-content">Contextos de uso</h4>
                        <span className="text-xs text-base-content/55">
                            {form.contexts.length} selecionado(s)
                        </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {DOCUMENT_TYPE_CONTEXT_ITEMS.map((item) => {
                            const checked = form.contexts.includes(item.value);
                            return (
                                <InputCheckbox
                                    key={item.value}
                                    size="xs"
                                    checked={checked}
                                    onCheckedChange={(next) => toggleContext(item.value, next)}
                                    label={item.label}
                                    className={clsx(
                                        "min-h-9 rounded-lg border px-3 py-2 transition-colors",
                                        checked
                                            ? "border-primary/35 bg-primary/8 text-primary"
                                            : "border-base-300/50 bg-base-200/20 text-base-content/85 hover:bg-base-200/40",
                                    )}
                                    labelClassName={clsx(
                                        "text-sm",
                                        checked ? "font-medium text-primary" : "text-base-content/75",
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
