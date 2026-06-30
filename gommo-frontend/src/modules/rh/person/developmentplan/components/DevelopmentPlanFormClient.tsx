"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { type SubmitEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { developmentPlanKeys } from "@/modules/rh/person/developmentplan/development-plan.query";
import type {
    CheckinFrequency,
    DevelopmentActionStatus,
    DevelopmentActionType,
    DevelopmentPlanActionItem,
    DevelopmentPlanCheckinItem,
    DevelopmentPlanCompetencyItem,
    DevelopmentPlanEvidenceItem,
    DevelopmentPlanFormDto,
    DevelopmentPlanGoalItem,
    GoalType,
} from "@/modules/rh/person/developmentplan/dto/development-plan.dto";
import { loadCollaboratorDevelopmentPlanContext } from "@/modules/rh/person/developmentplan/lib/collaborator-development-plan-context";
import {
    developmentPlanToFormDto,
    developmentPlanToRequestDto,
    emptyDevelopmentPlanForm,
} from "@/modules/rh/person/developmentplan/lib/development-plan.mapper";
import { developmentPlanService } from "@/modules/rh/person/developmentplan/services/development-plan.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate, InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "geral", label: "Dados gerais" },
    { id: "diagnostico", label: "Diagnóstico" },
    { id: "objetivos", label: "Objetivos" },
    { id: "checkins", label: "Check-ins" },
    { id: "evidencias", label: "Evidências" },
];

const FREQUENCY_ITEMS = [
    { value: "WEEKLY", label: "Semanal" },
    { value: "BIWEEKLY", label: "Quinzenal" },
    { value: "MONTHLY", label: "Mensal" },
    { value: "CUSTOM", label: "Personalizado" },
];
const GOAL_TYPE_ITEMS = [
    { value: "DEVELOP_COMPETENCY", label: "Desenvolver competência" },
    { value: "IMPROVE_PERFORMANCE", label: "Melhorar performance" },
    { value: "PREPARE_PROMOTION", label: "Preparar promoção" },
    { value: "CORRECT_BEHAVIOR", label: "Corrigir comportamento" },
    { value: "LEARN_TOOL", label: "Aprender ferramenta" },
    { value: "DEVELOP_LEADERSHIP", label: "Desenvolver liderança" },
];
const ACTION_TYPE_ITEMS = [
    { value: "COURSE", label: "Curso" },
    { value: "MENTORING", label: "Mentoria" },
    { value: "READING", label: "Leitura" },
    { value: "INTERNAL_TRAINING", label: "Treinamento interno" },
    { value: "JOB_ROTATION", label: "Job rotation" },
    { value: "PRACTICAL_PROJECT", label: "Projeto prático" },
    { value: "MANAGER_FOLLOWUP", label: "Acompanhamento do gestor" },
    { value: "STRUCTURED_FEEDBACK", label: "Feedback estruturado" },
    { value: "CERTIFICATION", label: "Certificação" },
];
const STATUS_ITEMS = [
    { value: "NOT_STARTED", label: "Não iniciada" },
    { value: "IN_PROGRESS", label: "Em andamento" },
    { value: "COMPLETED", label: "Concluída" },
    { value: "OVERDUE", label: "Atrasada" },
    { value: "CANCELED", label: "Cancelada" },
];

export function DevelopmentPlanFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<DevelopmentPlanFormDto>(emptyDevelopmentPlanForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: developmentPlanKeys.detail(editingId ?? ""),
        queryFn: () => developmentPlanService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyDevelopmentPlanForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(developmentPlanToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: DevelopmentPlanFormDto) => {
            if (isEditing && editingId) return developmentPlanService.update(editingId, developmentPlanToRequestDto(dto));
            return developmentPlanService.create(developmentPlanToRequestDto(dto));
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: developmentPlanKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: developmentPlanKeys.detail(editingId) });
            toast.success(isEditing ? "PDI atualizado" : "PDI cadastrado");
            setForm(emptyDevelopmentPlanForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível salvar o PDI." });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof DevelopmentPlanFormDto>(field: K, value: DevelopmentPlanFormDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const updateArray = <T,>(field: "competencies" | "goals" | "checkins" | "evidences", index: number, value: T) => {
        setForm((prev) => ({ ...prev, [field]: prev[field].map((item, i) => (i === index ? value : item)) }));
    };
    const removeArray = (field: "competencies" | "goals" | "checkins" | "evidences", index: number) => {
        setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };
    const handleCollaboratorChange = useCallback((collaboratorId: string) => {
        if (!collaboratorId) {
            setForm((prev) => ({
                ...prev,
                collaboratorId: "",
                collaboratorName: "",
                registrationNumber: undefined,
                jobPositionId: undefined,
                jobPositionName: "",
                departmentId: undefined,
                departmentName: "",
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            collaboratorId,
            registrationNumber: undefined,
            jobPositionId: undefined,
            jobPositionName: "",
            departmentId: undefined,
            departmentName: "",
        }));
        void loadCollaboratorDevelopmentPlanContext(collaboratorId)
            .then((ctx) => {
                setForm((prev) => {
                    if (prev.collaboratorId !== collaboratorId) return prev;
                    return {
                        ...prev,
                        collaboratorName: ctx.collaboratorName ?? prev.collaboratorName,
                        jobPositionId: ctx.jobPositionId,
                        jobPositionName: ctx.jobPositionName ?? "",
                        departmentId: ctx.departmentId,
                        departmentName: ctx.departmentName ?? "",
                    };
                });
            })
            .catch(() => undefined);
    }, []);
    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return <div className="p-5"><div className="skeleton-shimmer h-12 w-full" /></div>;
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{ steps: FORM_STEPS, entityCode: isEditing ? detailQuery.data?.code : undefined, resetKey: editingId ?? "new" }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
                    {isEditing ? <Button type="button" variant="outline" onClick={startCreate}>Novo</Button> : null}
                    <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
                </>
            }
        >
            <FormSection id="geral" title="Dados gerais">
                <CollaboratorPickerField value={form.collaboratorId ?? ""} onValueChange={handleCollaboratorChange} wrapperClassName="sm:col-span-6" required />
                <InputString label="Cargo atual" value={form.jobPositionName ?? ""} onValueChange={() => undefined} wrapperClassName="sm:col-span-3" disabled />
                <InputString label="Departamento" value={form.departmentName ?? ""} onValueChange={() => undefined} wrapperClassName="sm:col-span-3" disabled />
                <InputString label="Cargo alvo" value={form.targetJobPositionName ?? ""} onValueChange={(v) => update("targetJobPositionName", v)} wrapperClassName="sm:col-span-4" />
                <InputString label="Gestor responsável" value={form.managerName ?? ""} onValueChange={(v) => update("managerName", v)} wrapperClassName="sm:col-span-4" />
                <InputString label="Origem/motivo" value={form.originName ?? ""} onValueChange={(v) => update("originName", v)} wrapperClassName="sm:col-span-4" />
                <InputDate label="Data início" value={form.startDate ?? ""} onValueChange={(v) => update("startDate", v)} wrapperClassName="sm:col-span-4" />
                <InputDate label="Data fim" value={form.endDate ?? ""} onValueChange={(v) => update("endDate", v)} wrapperClassName="sm:col-span-4" />
                <InputSelect label="Frequência de check-in" items={FREQUENCY_ITEMS} value={form.checkinFrequency ?? ""} onValueChange={(v) => update("checkinFrequency", (v || undefined) as CheckinFrequency)} wrapperClassName="sm:col-span-4" />
                <InputNumber label="Dias personalizados" value={form.checkinFrequencyDays ?? null} onValueChange={(v) => update("checkinFrequencyDays", v ?? undefined)} integer wrapperClassName="sm:col-span-4" />
                <InputString label="Trilha" value={form.trackName ?? ""} onValueChange={(v) => update("trackName", v)} wrapperClassName="sm:col-span-4" />
                <InputString label="Observação" value={form.notes ?? ""} onValueChange={(v) => update("notes", v)} wrapperClassName="sm:col-span-12" />
            </FormSection>

            <FormSection id="diagnostico" title="Diagnóstico">
                <div className="sm:col-span-12 grid gap-3">
                    {form.competencies.map((item, index) => (
                        <div key={index} className="grid gap-3 rounded-xl border border-base-300 p-4 sm:grid-cols-12">
                            <InputString label="Competência" value={item.competencyName ?? ""} onValueChange={(v) => updateArray("competencies", index, { ...item, competencyName: v })} wrapperClassName="sm:col-span-4" required />
                            <InputString label="ID competência" value={item.competencyId ?? ""} onValueChange={(v) => updateArray("competencies", index, { ...item, competencyId: v })} wrapperClassName="sm:col-span-4" required />
                            <InputNumber label="Nível atual" value={item.currentLevelOrder ?? null} onValueChange={(v) => updateArray("competencies", index, { ...item, currentLevelOrder: v ?? undefined })} integer wrapperClassName="sm:col-span-2" />
                            <InputNumber label="Nível esperado" value={item.expectedLevelOrder ?? null} onValueChange={(v) => updateArray("competencies", index, { ...item, expectedLevelOrder: v ?? undefined })} integer wrapperClassName="sm:col-span-2" />
                            <InputString label="Observação" value={item.notes ?? ""} onValueChange={(v) => updateArray("competencies", index, { ...item, notes: v })} wrapperClassName="sm:col-span-10" />
                            <Button type="button" variant="warning" leftIcon={<Trash2 className="size-4" />} className="self-end sm:col-span-2" onClick={() => removeArray("competencies", index)}>Remover</Button>
                        </div>
                    ))}
                    <Button type="button" variant="primary" leftIcon={<Plus className="size-4" />} onClick={() => update("competencies", [...form.competencies, { competencyId: "", competencyName: "" } as DevelopmentPlanCompetencyItem])}>Adicionar competência</Button>
                </div>
            </FormSection>

            <FormSection id="objetivos" title="Objetivos e ações">
                <div className="sm:col-span-12 grid gap-4">
                    {form.goals.map((goal, goalIndex) => (
                        <div key={goalIndex} className="grid gap-3 rounded-xl border border-base-300 p-4 sm:grid-cols-12">
                            <InputString label="Objetivo" value={goal.title ?? ""} onValueChange={(v) => updateArray("goals", goalIndex, { ...goal, title: v })} wrapperClassName="sm:col-span-6" required />
                            <InputSelect label="Tipo" items={GOAL_TYPE_ITEMS} value={goal.type ?? ""} onValueChange={(v) => updateArray("goals", goalIndex, { ...goal, type: (v || undefined) as GoalType })} wrapperClassName="sm:col-span-3" />
                            <InputNumber label="Peso" value={goal.weight ?? null} onValueChange={(v) => updateArray("goals", goalIndex, { ...goal, weight: v ?? undefined })} integer wrapperClassName="sm:col-span-3" />
                            <InputString label="Descrição" value={goal.description ?? ""} onValueChange={(v) => updateArray("goals", goalIndex, { ...goal, description: v })} wrapperClassName="sm:col-span-6" />
                            <InputString label="Indicador de sucesso" value={goal.successIndicator ?? ""} onValueChange={(v) => updateArray("goals", goalIndex, { ...goal, successIndicator: v })} wrapperClassName="sm:col-span-4" />
                            <InputDate label="Prazo" value={goal.deadline ?? ""} onValueChange={(v) => updateArray("goals", goalIndex, { ...goal, deadline: v })} wrapperClassName="sm:col-span-2" />
                            <div className="sm:col-span-12 grid gap-3 border-t border-base-300 pt-3">
                                {goal.actions.map((action, actionIndex) => (
                                    <div key={actionIndex} className="grid gap-3 sm:grid-cols-12">
                                        <InputString label="Ação" value={action.title ?? ""} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, title: v })} wrapperClassName="sm:col-span-4" required />
                                        <InputSelect label="Tipo" items={ACTION_TYPE_ITEMS} value={action.actionType ?? ""} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, actionType: (v || undefined) as DevelopmentActionType })} wrapperClassName="sm:col-span-3" />
                                        <InputSelect label="Status" items={STATUS_ITEMS} value={action.status ?? ""} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, status: (v || undefined) as DevelopmentActionStatus })} wrapperClassName="sm:col-span-3" />
                                        <InputNumber label="%" value={action.progress ?? null} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, progress: v ?? undefined })} integer wrapperClassName="sm:col-span-2" />
                                        <InputDate label="Início" value={action.startDate ?? ""} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, startDate: v })} wrapperClassName="sm:col-span-3" />
                                        <InputDate label="Fim" value={action.endDate ?? ""} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, endDate: v })} wrapperClassName="sm:col-span-3" />
                                        <InputString label="Responsável" value={action.assignee ?? ""} onValueChange={(v) => updateGoalAction(goalIndex, actionIndex, { ...action, assignee: v })} wrapperClassName="sm:col-span-4" />
                                        <label className="flex items-center gap-2 pt-7 text-sm sm:col-span-2"><input type="checkbox" className="checkbox checkbox-sm" checked={Boolean(action.evidenceRequired)} onChange={(e) => updateGoalAction(goalIndex, actionIndex, { ...action, evidenceRequired: e.target.checked })} /> Evidência</label>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button type="button" variant="primary" leftIcon={<Plus className="size-4" />} onClick={() => updateArray("goals", goalIndex, { ...goal, actions: [...goal.actions, { title: "", evidenceRequired: false, progress: 0 } as DevelopmentPlanActionItem] })}>Adicionar ação</Button>
                                    <Button type="button" variant="warning" leftIcon={<Trash2 className="size-4" />} onClick={() => removeArray("goals", goalIndex)}>Remover objetivo</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="primary" leftIcon={<Plus className="size-4" />} onClick={() => update("goals", [...form.goals, { title: "", weight: 100, actions: [] } as DevelopmentPlanGoalItem])}>Adicionar objetivo</Button>
                </div>
            </FormSection>

            <FormSection id="checkins" title="Check-ins">
                <div className="sm:col-span-12 grid gap-3">
                    {form.checkins.map((item, index) => (
                        <div key={index} className="grid gap-3 rounded-xl border border-base-300 p-4 sm:grid-cols-12">
                            <InputDate label="Data" value={item.date ?? ""} onValueChange={(v) => updateArray("checkins", index, { ...item, date: v })} wrapperClassName="sm:col-span-3" required />
                            <InputString label="Participantes" value={item.participants ?? ""} onValueChange={(v) => updateArray("checkins", index, { ...item, participants: v })} wrapperClassName="sm:col-span-5" />
                            <InputNumber label="Progresso percebido" value={item.perceivedProgress ?? null} onValueChange={(v) => updateArray("checkins", index, { ...item, perceivedProgress: v ?? undefined })} integer wrapperClassName="sm:col-span-4" />
                            <InputString label="Resumo" value={item.summary ?? ""} onValueChange={(v) => updateArray("checkins", index, { ...item, summary: v })} wrapperClassName="sm:col-span-6" />
                            <InputString label="Próximos passos" value={item.nextSteps ?? ""} onValueChange={(v) => updateArray("checkins", index, { ...item, nextSteps: v })} wrapperClassName="sm:col-span-4" />
                            <Button type="button" variant="warning" leftIcon={<Trash2 className="size-4" />} className="self-end sm:col-span-2" onClick={() => removeArray("checkins", index)}>Remover</Button>
                        </div>
                    ))}
                    <Button type="button" variant="primary" leftIcon={<Plus className="size-4" />} onClick={() => update("checkins", [...form.checkins, { date: "" } as DevelopmentPlanCheckinItem])}>Adicionar check-in</Button>
                </div>
            </FormSection>

            <FormSection id="evidencias" title="Evidências">
                <div className="sm:col-span-12 grid gap-3">
                    {form.evidences.map((item, index) => (
                        <div key={index} className="grid gap-3 rounded-xl border border-base-300 p-4 sm:grid-cols-12">
                            <InputString label="Tipo" value={item.evidenceTypeName ?? ""} onValueChange={(v) => updateArray("evidences", index, { ...item, evidenceTypeName: v })} wrapperClassName="sm:col-span-3" />
                            <InputDate label="Data" value={item.date ?? ""} onValueChange={(v) => updateArray("evidences", index, { ...item, date: v })} wrapperClassName="sm:col-span-3" />
                            <InputString label="Arquivo" value={item.file ?? ""} onValueChange={(v) => updateArray("evidences", index, { ...item, file: v })} wrapperClassName="sm:col-span-3" />
                            <InputString label="Link" value={item.link ?? ""} onValueChange={(v) => updateArray("evidences", index, { ...item, link: v })} wrapperClassName="sm:col-span-3" />
                            <InputString label="Descrição" value={item.description ?? ""} onValueChange={(v) => updateArray("evidences", index, { ...item, description: v })} wrapperClassName="sm:col-span-10" />
                            <Button type="button" variant="warning" leftIcon={<Trash2 className="size-4" />} className="self-end sm:col-span-2" onClick={() => removeArray("evidences", index)}>Remover</Button>
                        </div>
                    ))}
                    <Button type="button" variant="primary" leftIcon={<Plus className="size-4" />} onClick={() => update("evidences", [...form.evidences, {} as DevelopmentPlanEvidenceItem])}>Adicionar evidência</Button>
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );

    function updateGoalAction(goalIndex: number, actionIndex: number, action: DevelopmentPlanActionItem) {
        const goal = form.goals[goalIndex];
        updateArray("goals", goalIndex, { ...goal, actions: goal.actions.map((item, i) => (i === actionIndex ? action : item)) });
    }
}