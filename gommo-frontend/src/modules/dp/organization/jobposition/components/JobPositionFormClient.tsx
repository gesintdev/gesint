"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import {DepartmentPickerField} from "@/modules/dp/organization/department/components/DepartmentPickerField";
import type {JobPositionCreateDto, JobPositionNature} from "@/modules/dp/organization/jobposition/dto/jobposition.dto";
import {JOBPOSITION_CLIENT_MESSAGES} from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import {jobpositionKeys} from "@/modules/dp/organization/jobposition/jobposition.query";
import {
    emptyJobPositionForm,
    jobpositionToFormDto,
} from "@/modules/dp/organization/jobposition/lib/jobposition.mapper";
import {cboOccupationService} from "@/modules/dp/organization/jobposition/services/cbo-occupation.service";
import {jobpositionService} from "@/modules/dp/organization/jobposition/services/jobposition.service";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputSelect, InputSelectAutocomplete, InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{id: "cadastro", label: "Cargo"}];

const JOB_POSITION_NATURE_ITEMS = [
    {value: "OPERATIONAL", label: "Operacional"},
    {value: "TECHNICAL", label: "Técnico"},
    {value: "SPECIALIST", label: "Especialista"},
    {value: "LEADERSHIP", label: "Gestão"},
    {value: "EXECUTIVE", label: "Executivo"},
];

export function JobPositionFormClient() {
    const {editingId, isEditing, goToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<JobPositionCreateDto>(emptyJobPositionForm);
    const [cboLabel, setCboLabel] = useState("");
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: jobpositionKeys.detail(editingId ?? ""),
        queryFn: () => jobpositionService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyJobPositionForm());
            setCboLabel("");
            setError(null);
            return;
        }

        if (detailQuery.data) {
            const nextForm = jobpositionToFormDto(detailQuery.data);
            setForm(nextForm);
            setCboLabel(nextForm.cboCode ?? "");
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    useEffect(() => {
        const code = form.cboCode?.trim() ?? "";
        if (!code) {
            setCboLabel("");
            return;
        }

        let cancelled = false;
        void cboOccupationService.findByCode(code).then((option) => {
            if (cancelled) return;
            setCboLabel(option ? cboOccupationService.formatLabel(option) : code);
        });
        return () => {
            cancelled = true;
        };
    }, [form.cboCode]);

    const saveMutation = useMutation({
        mutationFn: async (dto: JobPositionCreateDto) => {
            if (isEditing && editingId) return jobpositionService.update(editingId, dto);
            return jobpositionService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: jobpositionKeys.all});
            if (editingId) await queryClient.invalidateQueries({queryKey: jobpositionKeys.detail(editingId)});
            toast.success(isEditing ? "Cargo atualizado(a)" : "Cargo cadastrado(a)");
            setForm(emptyJobPositionForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof JobPositionCreateDto>(field: K, value: JobPositionCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full"/>
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

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
                    {isEditing && (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    )}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Cargo">
                <InputString
                    label="Título do cargo"
                    value={form.title ?? ""}
                    onValueChange={(v) => update("title", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelectAutocomplete
                    label="Código CBO"
                    value={form.cboCode ?? ""}
                    selectedLabel={cboLabel}
                    onSearch={(query, page) => cboOccupationService.search(query, page)}
                    onValueChange={(value, item) => {
                        update("cboCode", value || undefined);
                        setCboLabel(item?.label ?? value);
                    }}
                    remoteMinChars={0}
                    placeholder="Busque por código ou ocupação..."
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Natureza do cargo"
                    items={JOB_POSITION_NATURE_ITEMS}
                    value={form.nature ?? ""}
                    onValueChange={(v) => update("nature", (v || undefined) as JobPositionNature | undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                <DepartmentPickerField
                    value={form.departmentId ?? ""}
                    onValueChange={(v) => update("departmentId", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
