"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Copy, ExternalLink } from "lucide-react";
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import { jobpositionService } from "@/modules/dp/organization/jobposition/services/jobposition.service";
import { JobVacancyCompetencySection } from "@/modules/rh/person/jobvacancy/competency/components/JobVacancyCompetencySection";
import type {
    JobBoardKey,
    JobVacancyContractType,
    JobVacancyCreateDto,
    JobVacancySeniority,
    JobVacancyWorkModality,
} from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { JOB_VACANCY_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancy/exceptions/job-vacancy.messages";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import {
    emptyJobVacancyForm,
    jobVacancyFormToPayload,
    jobVacancyToFormDto,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.mapper";
import { slugFromJobTitle } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-slug";
import {
    JOB_BOARD_OPTIONS,
    JOB_VACANCY_CONTRACT_TYPE_ITEMS,
    JOB_VACANCY_SENIORITY_ITEMS,
    JOB_VACANCY_WORK_MODALITY_ITEMS,
    JOB_VACANCY_WORK_SCHEDULE_ITEMS,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { CollaboratorMultiPickerField } from "@/shared/components/crud/CollaboratorMultiPickerField";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { CrudFormFooterActions } from "@/shared/components/crud/CrudFormFooterActions";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import {
    InputCurrency,
    InputCheckbox,
    InputDate,
    InputMarkdown,
    InputMultiValue,
    InputNumber,
    InputSelect,
    InputString,
} from "@/shared/components/ui/input/index";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Dados" },
    { id: "detalhes", label: "Detalhes" },
    { id: "responsaveis", label: "Responsáveis" },
    { id: "competencias-entrevista", label: "Competências" },
    { id: "publicacao", label: "Publicação" },
];

type TextAreaProps = {
    label: string;
    value?: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
    placeholder?: string;
    rows?: number;
};

function TextAreaField({ label, value, onValueChange, wrapperClassName, placeholder, rows = 4 }: TextAreaProps) {
    const autoId = useId();
    const id = `job-vacancy-${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}`;

    return (
        <InputFieldChrome label={label} id={id} wrapperClassName={wrapperClassName}>
            <textarea
                id={id}
                rows={rows}
                value={value ?? ""}
                placeholder={placeholder}
                onChange={(event) => onValueChange(event.target.value)}
                className={clsx("gommo-control w-full resize-y px-3 py-2 text-sm", fieldClass())}
            />
        </InputFieldChrome>
    );
}

function buildWhatsAppShareText(jobTitle: string, url: string): string {
    const title = jobTitle.trim() || "vaga";
    return `Olá! Confira a vaga de ${title}: ${url}`;
}

export function JobVacancyFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setFormState] = useState<JobVacancyCreateDto>(emptyJobVacancyForm);
    const [error, setError] = useState<string | null>(null);
    /** Garante que o InputMarkdown só monte depois do form estar hidratado com o GET. */
    const [seededForId, setSeededForId] = useState<string | null>(null);
    const formRef = useRef(form);
    const wasEditingRef = useRef(isEditing);
    const setForm = (
        updater: JobVacancyCreateDto | ((prev: JobVacancyCreateDto) => JobVacancyCreateDto),
    ) => {
        const prev = formRef.current;
        const next = typeof updater === "function" ? updater(prev) : updater;
        formRef.current = next;
        setFormState(next);
    };
    const detailQuery = useQuery({
        queryKey: jobVacancyKeys.detail(editingId ?? ""),
        queryFn: () => jobVacancyService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        const wasEditing = wasEditingRef.current;
        wasEditingRef.current = isEditing;
        // Só limpa ao sair da edição para um cadastro novo — não a cada mount.
        if (wasEditing && !isEditing) {
            setForm(emptyJobVacancyForm());
            setSeededForId(null);
            setError(null);
        }
    }, [isEditing]);

    useEffect(() => {
        if (!isEditing || !detailQuery.data) return;
        setForm(jobVacancyToFormDto(detailQuery.data));
        setSeededForId(detailQuery.data.id);
        setError(null);
    }, [isEditing, detailQuery.data]);
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: jobVacancyToFormDto,
        getEmptyForm: () => emptyJobVacancyForm(),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: JobVacancyCreateDto) => {
            const payload = jobVacancyFormToPayload(dto);
            if (isEditing && editingId) return jobVacancyService.update(editingId, payload);
            return jobVacancyService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.detail(editingId) });
            toast.success(isEditing ? "Vaga atualizada" : "Vaga cadastrada");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof JobVacancyCreateDto>(field: K, value: JobVacancyCreateDto[K]) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "jobTitle" && (!prev.slug || prev.slug === slugFromJobTitle(prev.jobTitle))) {
                next.slug = slugFromJobTitle(String(value ?? ""));
            }
            return next;
        });
    };
    const applyJobPosition = async (jobPositionId: string) => {
        if (!jobPositionId.trim()) {
            setForm((prev) => ({ ...prev, jobPositionId: null, jobTitle: "" }));
            return;
        }
        try {
            const position = await jobpositionService.getById(jobPositionId);
            setForm((prev) => {
                const title = position.title ?? prev.jobTitle;
                const autoSlug = !prev.slug || prev.slug === slugFromJobTitle(prev.jobTitle);
                return {
                    ...prev,
                    jobPositionId,
                    jobTitle: title,
                    slug: autoSlug ? slugFromJobTitle(title) : prev.slug,
                };
            });
        } catch {
            setForm((prev) => ({ ...prev, jobPositionId }));
        }
    };
    const toggleBoard = (board: JobBoardKey) => {
        setForm((prev) => {
            const current = prev.targetBoards ?? [];
            const next = current.includes(board)
                ? current.filter((item) => item !== board)
                : [...current, board];
            return { ...prev, targetBoards: next };
        });
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        // formRef é atualizado de forma síncrona em todo setForm (inclui blur do markdown).
        const snapshot = formRef.current;
        if (!snapshot.jobPositionId?.trim()) {
            setError("Selecione o cargo vinculado à vaga.");
            return;
        }
        if (!snapshot.jobTitle.trim()) {
            setError("Informe o nome do cargo da vaga.");
            return;
        }
        if (!snapshot.positionsCount || snapshot.positionsCount < 1) {
            setError("A quantidade de posições deve ser maior que zero.");
            return;
        }
        if (
            snapshot.candidateReturnSlaBusinessDays != null &&
            snapshot.candidateReturnSlaBusinessDays < 1
        ) {
            setError("O prazo de retorno ao candidato deve ser de pelo menos 1 dia útil.");
            return;
        }
        if (snapshot.isPublic && !(snapshot.slug?.trim() || slugFromJobTitle(snapshot.jobTitle))) {
            setError("Informe um slug válido para a página pública.");
            return;
        }
        saveMutation.mutate(snapshot);
    };
    const publicSlug = form.slug?.trim() || slugFromJobTitle(form.jobTitle);
    const publicCareersUrl = useMemo(() => {
        if (!publicSlug || typeof window === "undefined") return "";
        return `${window.location.origin}/careers/${encodeURIComponent(publicSlug)}`;
    }, [publicSlug]);
    const whatsappShareUrl = useMemo(() => {
        if (!publicCareersUrl) return "";
        return `${publicCareersUrl}?origem=whatsapp`;
    }, [publicCareersUrl]);
    const whatsappShareText = useMemo(
        () => buildWhatsAppShareText(form.jobTitle, whatsappShareUrl || publicCareersUrl),
        [form.jobTitle, whatsappShareUrl, publicCareersUrl],
    );
    const copyPublicLink = async () => {
        if (!publicCareersUrl) return;
        try {
            await navigator.clipboard.writeText(publicCareersUrl);
            toast.success("Link da candidatura copiado");
        } catch {
            toast.error("Não foi possível copiar o link.");
        }
    };
    const copyWhatsAppText = async () => {
        if (!whatsappShareText) return;
        try {
            await navigator.clipboard.writeText(whatsappShareText);
            toast.success("Texto do WhatsApp copiado");
        } catch {
            toast.error("Não foi possível copiar o texto.");
        }
    };

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    // Espera o GET e a hidratação do state — senão o TipTap monta com description vazia.
    if (isEditing && (detailQuery.isLoading || seededForId !== editingId)) {
        return (
            <SkeletonStack count={4} padded />
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
            footer={<CrudFormFooterActions isSubmitting={saveMutation.isPending} />}
        >
            <FormSection id="dados" title="Dados da vaga">
                <JobPositionPickerField
                    label="Cargo"
                    hint="Obrigatório. Título e competências herdam do cargo cadastrado."
                    value={form.jobPositionId ?? ""}
                    onValueChange={(id) => {
                        void applyJobPosition(id);
                    }}
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputNumber
                    label="Posições"
                    value={form.positionsCount ?? null}
                    onValueChange={(v) => update("positionsCount", v ?? 1)}
                    integer
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Título da vaga"
                    value={form.jobTitle ?? ""}
                    onValueChange={(v) => update("jobTitle", v)}
                    hint="Preenchido pelo cargo; pode ajustar o texto público."
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputSelect
                    label="Senioridade"
                    items={JOB_VACANCY_SENIORITY_ITEMS}
                    value={form.seniorityLevel ?? ""}
                    onValueChange={(v) =>
                        update("seniorityLevel", (v || undefined) as JobVacancySeniority | undefined)
                    }
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-4"
                />
                <InputCurrency
                    label="Salário (mín.)"
                    value={form.salary != null ? String(form.salary) : ""}
                    onValueChange={(v) => update("salary", v)}
                    emitAsDecimal
                    wrapperClassName="sm:col-span-4"
                />
                <InputCurrency
                    label="Salário (máx.)"
                    value={form.salaryMax != null ? String(form.salaryMax) : ""}
                    onValueChange={(v) => update("salaryMax", v)}
                    emitAsDecimal
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Área / departamento"
                    value={form.department ?? ""}
                    onValueChange={(v) => update("department", v)}
                    placeholder="Ex.: Engenharia de Produto"
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Local"
                    value={form.location ?? ""}
                    onValueChange={(v) => update("location", v)}
                    placeholder="Ex.: São Paulo, SP"
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Previsão de conclusão"
                    value={form.expectedCompletionDate ?? ""}
                    onValueChange={(v) => update("expectedCompletionDate", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputSelect
                    label="Modalidade"
                    items={JOB_VACANCY_WORK_MODALITY_ITEMS}
                    value={form.workModality ?? ""}
                    onValueChange={(v) =>
                        update("workModality", (v || undefined) as JobVacancyWorkModality | undefined)
                    }
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-4"
                />
                <InputSelect
                    label="Tipo de contrato"
                    items={JOB_VACANCY_CONTRACT_TYPE_ITEMS}
                    value={form.contractType ?? ""}
                    onValueChange={(v) =>
                        update("contractType", (v || undefined) as JobVacancyContractType | undefined)
                    }
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-4"
                />
                <InputSelect
                    label="Jornada"
                    items={JOB_VACANCY_WORK_SCHEDULE_ITEMS}
                    value={form.workSchedule ?? ""}
                    onValueChange={(v) => update("workSchedule", v || undefined)}
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-4"
                />
                <label
                    className={clsx(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors sm:col-span-12",
                        form.affirmativePcd
                            ? "border-primary/40 bg-primary/5"
                            : "border-base-300 bg-base-100 hover:border-base-content/20",
                    )}
                >
                    <InputCheckbox
                        size="sm"
                        checked={Boolean(form.affirmativePcd)}
                        onCheckedChange={(checked) => update("affirmativePcd", checked)}
                        className="mt-0.5"
                        aria-label="Vaga afirmativa / PCD"
                    />
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold text-base-content">
                            Vaga afirmativa / PCD
                        </span>
                        <span className="mt-0.5 block text-xs text-base-content/55">
                            Ativa a autodeclaração opcional no portal do candidato (fluxo completo na T13). A
                            flag da vaga já fica persistida.
                        </span>
                    </span>
                </label>
            </FormSection>

            <FormSection id="detalhes" title="Detalhes">
                <InputMarkdown
                    key={`description-${editingId ?? "new"}`}
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => update("description", v)}
                    wrapperClassName="sm:col-span-12"
                    rows={12}
                />
                <InputMultiValue
                    label="Atividades"
                    value={form.activities ?? ""}
                    onValueChange={(v) => update("activities", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Digite e pressione Tab"
                />
                <InputMultiValue
                    label="Atribuições"
                    value={form.assignments ?? ""}
                    onValueChange={(v) => update("assignments", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Digite e pressione Tab"
                />
                <InputMultiValue
                    label="Requisitos"
                    value={form.requirements ?? ""}
                    onValueChange={(v) => update("requirements", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Digite e pressione Tab"
                />
                <TextAreaField
                    label="Benefícios"
                    value={form.benefits}
                    onValueChange={(v) => update("benefits", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Um benefício por linha"
                />
            </FormSection>

            <FormSection id="responsaveis" title="Responsáveis">
                <CollaboratorPickerField
                    label="Recrutador(a)"
                    value={form.recruiterCollaboratorId ?? ""}
                    onValueChange={(id) => update("recruiterCollaboratorId", id || null)}
                    wrapperClassName="sm:col-span-6"
                />
                <CollaboratorPickerField
                    label="Gestor(a) requisitante"
                    value={form.requestingManagerCollaboratorId ?? ""}
                    onValueChange={(id) => update("requestingManagerCollaboratorId", id || null)}
                    managersOnly
                    hint="Somente colaboradores em cargos de gestão"
                    wrapperClassName="sm:col-span-6"
                />
                <CollaboratorMultiPickerField
                    label="Entrevistadores"
                    hint="Colaboradores que participam das entrevistas desta vaga"
                    selectedIds={form.interviewerCollaboratorIds ?? []}
                    onChange={(ids) => update("interviewerCollaboratorIds", ids)}
                    wrapperClassName="sm:col-span-8"
                />
                <InputNumber
                    label="Prazo de retorno ao candidato"
                    hint="Dias úteis (mín. 1)"
                    value={form.candidateReturnSlaBusinessDays ?? 5}
                    onValueChange={(v) => update("candidateReturnSlaBusinessDays", v ?? 5)}
                    integer
                    wrapperClassName="sm:col-span-4"
                />
            </FormSection>

            <JobVacancyCompetencySection
                jobVacancyId={isEditing ? editingId : null}
                hasJobPosition={Boolean(form.jobPositionId)}
            />

            <FormSection id="publicacao" title="Publicação" bodyClassName="!grid-cols-1">
                <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                    <div className="grid gap-4 content-start lg:col-span-5">
                        <label
                            className={clsx(
                                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                                form.isPublic
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-base-300 bg-base-100 hover:border-base-content/20",
                            )}
                        >
                            <InputCheckbox
                                size="sm"
                                checked={Boolean(form.isPublic)}
                                onCheckedChange={(checked) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        isPublic: checked,
                                        slug: prev.slug?.trim() || slugFromJobTitle(prev.jobTitle),
                                        publishGoogleJobs:
                                            checked && prev.publishGoogleJobs == null
                                                ? true
                                                : prev.publishGoogleJobs,
                                    }));
                                }}
                                className="mt-0.5"
                                aria-label="Publicar página de candidatura"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-base-content">
                                    Publicar página de candidatura
                                </span>
                                <span className="mt-0.5 block text-xs text-base-content/55">
                                    Gera um link público para candidatos se inscreverem sem login.
                                </span>
                            </span>
                        </label>

                        <label
                            className={clsx(
                                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                                !form.isPublic && "opacity-60",
                                form.isPublic && form.publishGoogleJobs !== false
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-base-300 bg-base-100 hover:border-base-content/20",
                            )}
                        >
                            <InputCheckbox
                                size="sm"
                                checked={form.publishGoogleJobs !== false}
                                disabled={!form.isPublic}
                                onCheckedChange={(checked) => update("publishGoogleJobs", checked)}
                                className="mt-0.5"
                                aria-label="Google for Jobs"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-base-content">
                                    Google for Jobs
                                </span>
                                <span className="mt-0.5 block text-xs text-base-content/55">
                                    Publica dados estruturados (JSON-LD JobPosting) na página pública.
                                </span>
                            </span>
                        </label>

                        <InputString
                            label="Slug do link"
                            value={form.slug ?? ""}
                            onValueChange={(v) => update("slug", v)}
                            placeholder="ex.: analista-rh-sp"
                            disabled={!form.isPublic}
                        />

                        {form.isPublic && publicSlug ? (
                            <div className="rounded-xl border border-base-content/10 bg-base-200/40 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-base-content/45">
                                    Link público
                                </p>
                                <p className="mt-1 break-all text-sm text-base-content">{publicCareersUrl}</p>
                                {!isEditing ? (
                                    <p className="mt-2 text-xs text-warning">
                                        A página só fica disponível depois de salvar a vaga. Até lá o link ainda não
                                        funciona.
                                    </p>
                                ) : null}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        leftIcon={<Copy className="size-3.5" strokeWidth={2.25} />}
                                        onClick={() => void copyPublicLink()}
                                    >
                                        Copiar link
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        leftIcon={<ExternalLink className="size-3.5" strokeWidth={2.25} />}
                                        disabled={!isEditing}
                                        title={
                                            isEditing
                                                ? undefined
                                                : "Salve a vaga para liberar a página pública"
                                        }
                                        onClick={() =>
                                            window.open(publicCareersUrl, "_blank", "noopener,noreferrer")
                                        }
                                    >
                                        Abrir página
                                    </Button>
                                </div>

                                <div className="mt-4 border-t border-base-content/10 pt-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.04em] text-base-content/45">
                                        WhatsApp
                                    </p>
                                    <p className="mt-1 text-xs text-base-content/55">
                                        Texto pronto para colar no WhatsApp (inclui origem=whatsapp).
                                    </p>
                                    <textarea
                                        readOnly
                                        rows={3}
                                        value={whatsappShareText}
                                        className={clsx(
                                            "gommo-control mt-2 w-full resize-none px-3 py-2 text-sm",
                                            fieldClass(),
                                        )}
                                    />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            leftIcon={<Copy className="size-3.5" strokeWidth={2.25} />}
                                            onClick={() => void copyWhatsAppText()}
                                        >
                                            Copiar texto
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            disabled={!isEditing}
                                            title={
                                                isEditing
                                                    ? undefined
                                                    : "Salve a vaga para liberar o compartilhamento"
                                            }
                                            onClick={() =>
                                                window.open(
                                                    `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`,
                                                    "_blank",
                                                    "noopener,noreferrer",
                                                )
                                            }
                                        >
                                            Abrir WhatsApp
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid gap-3 content-start lg:col-span-7">
                        <div>
                            <p className="text-sm font-medium text-base-content">Sites de divulgação</p>
                            <p className="mt-1 text-sm text-base-content/60">
                                Selecione onde pretende divulgar a vaga. O envio automático será liberado depois; por
                                enquanto apenas a preferência é salva.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {JOB_BOARD_OPTIONS.map((board) => {
                                const checked = form.targetBoards?.includes(board.key) ?? false;
                                return (
                                    <label
                                        key={board.key}
                                        className={clsx(
                                            "flex h-full cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 transition-colors",
                                            checked
                                                ? "border-primary/40 bg-primary/5"
                                                : "border-base-300 bg-base-100 hover:border-base-content/20",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <InputCheckbox
                                                    size="sm"
                                                    checked={checked}
                                                    onChange={() => toggleBoard(board.key)}
                                                    aria-label={board.label}
                                                />
                                                <span className="text-sm font-semibold text-base-content">
                                                    {board.label}
                                                </span>
                                            </div>
                                            <span className="shrink-0 rounded-md bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/55">
                                                Em breve
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-base-content/55">
                                            {board.description}
                                        </p>
                                        <p className="mt-auto text-[11px] text-base-content/45">{board.accessNote}</p>
                                    </label>
                                );
                            })}
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                disabled
                                title="Publicação em sites será liberada em breve"
                            >
                                Publicar nos sites selecionados
                            </Button>
                        </div>
                    </div>
                </div>
            </FormSection>

            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
