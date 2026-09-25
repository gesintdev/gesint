"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import {DepartmentPickerField} from "@/modules/dp/organization/department/components/DepartmentPickerField";
import {JobPositionCompetencySection} from "@/modules/dp/organization/jobposition/competency/components/JobPositionCompetencySection";
import type {JobPositionCreateDto, JobPositionNature} from "@/modules/dp/organization/jobposition/dto/jobposition.dto";
import {JOBPOSITION_CLIENT_MESSAGES} from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import {jobpositionKeys} from "@/modules/dp/organization/jobposition/jobposition.query";
import { JOB_POSITION_NATURE_ITEMS } from "@/modules/dp/organization/jobposition/lib/job-position.options";
import {
    emptyJobPositionForm,
    jobpositionToFormDto,
} from "@/modules/dp/organization/jobposition/lib/jobposition.mapper";
import {JobPositionSalaryTableSection} from "@/modules/dp/organization/jobposition/salarytable/components/JobPositionSalaryTableSection";
import {cboOccupationService} from "@/modules/dp/organization/jobposition/services/cbo-occupation.service";
import {jobpositionService} from "@/modules/dp/organization/jobposition/services/jobposition.service";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {BranchRecordScopeField} from "@/shared/components/crud/BranchRecordScopeField";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputSelect, InputSelectAutocomplete, InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";
import {useBranchScopedDetailQuery} from "@/shared/hooks/useBranchScopedDetailQuery";
import {useActiveBranch} from "@/shared/context/ActiveBranchContext";

const FORM_STEPS: FormStepNavItem[] = [
    {id: "cadastro", label: "Cargo"},
    {id: "competencias", label: "Competências"},
    {id: "niveis-faixas", label: "Níveis e faixas"},
];

export function JobPositionFormClient() {
    const {editingId, isEditing, goToList, returnToList, startCreate} = useCrudScreen();
    const {activeBranchId} = useActiveBranch();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<JobPositionCreateDto>(() => emptyJobPositionForm(activeBranchId));
    const [cboLabel, setCboLabel] = useState("");
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useBranchScopedDetailQuery(
        jobpositionKeys.detail(editingId ?? ""),
        () => jobpositionService.getById(editingId!),
        {enabled: isEditing && Boolean(editingId)},
    );

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyJobPositionForm(activeBranchId));
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
    }, [isEditing, detailQuery.data, activeBranchId]);

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
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: jobpositionToFormDto,
        getEmptyForm: () => emptyJobPositionForm(activeBranchId),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: JobPositionCreateDto) => {
            if (isEditing && editingId) return jobpositionService.update(editingId, dto);
            return jobpositionService.create(dto);
        },
        onSuccess: async () => {
            const savedEditingId = editingId;
            returnToList();
            toast.success(isEditing ? "Cargo atualizado(a)" : "Cargo cadastrado(a)");
            setForm(emptyJobPositionForm(activeBranchId));
            await queryClient.invalidateQueries({queryKey: jobpositionKeys.all});
            if (savedEditingId) {
                queryClient.removeQueries({queryKey: jobpositionKeys.detail(savedEditingId)});
            }
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

    if (isEditing && detailQuery.isError && !saveMutation.isPending) {
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
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Cargo">
                <BranchRecordScopeField
                    companyId={form.companyId}
                    onChange={(companyId) => update("companyId", companyId)}
                />
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

            <JobPositionCompetencySection jobPositionId={isEditing ? editingId : null} />

            <JobPositionSalaryTableSection jobPositionId={isEditing ? editingId : null} />

            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
