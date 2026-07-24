"use client";

import {useMutation, useQuery} from "@tanstack/react-query";
import clsx from "clsx";
import {BriefcaseBusiness, Check, ChevronDown, FileText, Plus, Upload} from "lucide-react";
import {type ChangeEvent, type DragEvent, type FormEvent, useMemo, useRef, useState} from "react";

import type {
    PublicJobApplicationPayload,
    PublicJobVacancy
} from "@/modules/rh/person/jobvacancy/dto/public-careers.dto";
import {
    BRAZIL_STATE_CODES,
    CAREERS_MONTHS,
    CAREERS_REFERRAL_OPTIONS,
    CAREERS_YEARS,
    type CareersExperienceForm,
    createEmptyCareersExperience,
    formatPublishedLabel,
    formatSalaryRange,
    monthYearToIsoDate,
    splitLines,
} from "@/modules/rh/person/jobvacancy/lib/careers-form.util";
import {
    JOB_VACANCY_CONTRACT_TYPE_LABELS,
    JOB_VACANCY_SENIORITY_LABELS,
    JOB_VACANCY_WORK_MODALITY_LABELS,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import {publicCareersService} from "@/modules/rh/person/jobvacancy/services/public-careers.service";
import {ThemeToggle} from "@/shared/components/layout/ThemeToggle";
import {Button} from "@/shared/components/ui/Button";
import {InputCPF, InputCheckbox, InputPhone, InputSelect, InputString} from "@/shared/components/ui/input/index";
import {MarkdownContent} from "@/shared/components/ui/MarkdownContent";
import {ExceptionCapture} from "@/shared/exceptions";
import {digitsOnly} from "@/shared/lib/input/digits";

type ApplyFormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cpf: string;
    city: string;
    stateCode: string;
    linkedinUrl: string;
    portfolioUrl: string;
    coverLetter: string;
    referralSource: string;
    experiences: CareersExperienceForm[];
};

function emptyForm(): ApplyFormState {
    return {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        cpf: "",
        city: "",
        stateCode: "",
        linkedinUrl: "",
        portfolioUrl: "",
        coverLetter: "",
        referralSource: "",
        experiences: [createEmptyCareersExperience()],
    };
}

function ProgressBar({step, total}: { step: number; total: number }) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({length: total}).map((_, index) => (
                <div
                    key={index}
                    className={clsx(
                        "h-1 flex-1 rounded-sm transition-colors duration-300",
                        index < step ? "bg-primary" : "bg-base-300",
                    )}
                />
            ))}
        </div>
    );
}

function SectionHeader({number, title, subtitle}: { number: string; title: string; subtitle?: string }) {
    return (
        <div className="mb-7 flex items-start gap-4">
            <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-content">
                {number}
            </div>
            <div>
                <h2 className="text-[17px] font-bold text-base-content">{title}</h2>
                {subtitle ? <p className="mt-0.5 text-[13px] text-base-content/55">{subtitle}</p> : null}
            </div>
        </div>
    );
}

function ExperienceCard({
                            exp,
                            index,
                            onChange,
                            onRemove,
                            isOnly,
                        }: {
    exp: CareersExperienceForm;
    index: number;
    onChange: (id: string, patch: Partial<CareersExperienceForm>) => void;
    onRemove: (id: string) => void;
    isOnly: boolean;
}) {
    const [expanded, setExpanded] = useState(true);
    const monthItems = CAREERS_MONTHS.map((month) => ({value: month, label: month}));
    const yearItems = CAREERS_YEARS.map((year) => ({value: year, label: year}));

    return (
        <div className="mb-3 overflow-hidden rounded-[10px] border border-base-content/10">
            <div
                className={clsx(
                    "flex w-full items-center justify-between px-[18px] py-3.5",
                    expanded ? "bg-base-200/60" : "bg-base-100",
                )}
            >
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                        <BriefcaseBusiness className="size-3.5 text-primary"/>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-base-content">
                            {exp.jobTitle || exp.companyName
                                ? `${exp.jobTitle || "—"}${exp.companyName ? ` · ${exp.companyName}` : ""}`
                                : `Experiência ${index + 1}`}
                        </div>
                        {!expanded && exp.startYear ? (
                            <div className="mt-0.5 text-xs text-base-content/45">
                                {exp.startMonth} {exp.startYear} —{" "}
                                {exp.currentJob ? "Atual" : `${exp.endMonth} ${exp.endYear}`}
                            </div>
                        ) : null}
                    </div>
                </button>
                <div className="flex items-center gap-2">
                    {!isOnly ? (
                        <button
                            type="button"
                            onClick={() => onRemove(exp.id)}
                            className="rounded px-1.5 py-1 text-xs text-base-content/45 hover:text-error"
                        >
                            Remover
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        aria-label={expanded ? "Recolher experiência" : "Expandir experiência"}
                        className="p-1"
                    >
                        <ChevronDown
                            className={clsx(
                                "size-4 text-base-content/45 transition-transform",
                                expanded && "rotate-180",
                            )}
                        />
                    </button>
                </div>
            </div>

            {expanded ? (
                <div className="grid gap-4 border-t border-base-content/5 px-[18px] py-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputString
                            label="Empresa"
                            required
                            value={exp.companyName}
                            onValueChange={(value) => onChange(exp.id, {companyName: value})}
                            placeholder="Nome da empresa"
                        />
                        <InputString
                            label="Cargo"
                            required
                            value={exp.jobTitle}
                            onValueChange={(value) => onChange(exp.id, {jobTitle: value})}
                            placeholder="Seu cargo"
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <InputSelect
                            label="Mês início"
                            items={monthItems}
                            value={exp.startMonth}
                            onValueChange={(value) => onChange(exp.id, {startMonth: value})}
                            placeholder="Mês"
                        />
                        <InputSelect
                            label="Ano início"
                            items={yearItems}
                            value={exp.startYear}
                            onValueChange={(value) => onChange(exp.id, {startYear: value})}
                            placeholder="Ano"
                        />
                        <InputSelect
                            label="Mês fim"
                            items={monthItems}
                            value={exp.endMonth}
                            onValueChange={(value) => onChange(exp.id, {endMonth: value})}
                            placeholder="Mês"
                            disabled={exp.currentJob}
                        />
                        <InputSelect
                            label="Ano fim"
                            items={yearItems}
                            value={exp.endYear}
                            onValueChange={(value) => onChange(exp.id, {endYear: value})}
                            placeholder="Ano"
                            disabled={exp.currentJob}
                        />
                    </div>
                    <InputCheckbox
                        size="sm"
                        checked={exp.currentJob}
                        onCheckedChange={(next) =>
                            onChange(exp.id, {
                                currentJob: next,
                                endMonth: next ? "" : exp.endMonth,
                                endYear: next ? "" : exp.endYear,
                            })
                        }
                        label="Trabalho aqui atualmente"
                        labelClassName="text-[13px] text-base-content/75"
                    />
                    <label className="grid gap-1.5">
                        <span className="text-[13px] font-medium text-base-content/80">
                            Descrição das atividades
                        </span>
                        <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(event) => onChange(exp.id, {description: event.target.value})}
                            placeholder="Descreva suas principais responsabilidades e conquistas..."
                            className="w-full resize-y rounded-lg border border-base-content/15 bg-base-100 px-3.5 py-3 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]"
                        />
                    </label>
                </div>
            ) : null}
        </div>
    );
}

function ResumeUpload({file, onChange}: { file: File | null; onChange: (file: File | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        const dropped = event.dataTransfer.files[0];
        if (dropped) onChange(dropped);
    };

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) onChange(event.target.files[0]);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (file) {
        return (
            <div
                className="flex items-center justify-between rounded-[10px] border border-primary bg-primary/5 px-[18px] py-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-content">
                        <FileText className="size-4"/>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-base-content">{file.name}</div>
                        <div className="mt-0.5 text-xs text-base-content/55">{formatSize(file.size)}</div>
                    </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
                    Remover
                </Button>
            </div>
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={clsx(
                "cursor-pointer rounded-[10px] border-2 border-dashed px-6 py-9 text-center transition-colors",
                dragging ? "border-primary bg-primary/5" : "border-base-content/20 bg-base-200/40",
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFile}
                className="hidden"
            />
            <div className="mx-auto mb-3.5 flex size-12 items-center justify-center rounded-[10px] bg-primary/10">
                <Upload className="size-5 text-primary"/>
            </div>
            <div className="mb-1.5 text-[15px] font-semibold text-base-content">
                Arraste seu currículo ou clique para selecionar
            </div>
            <div className="text-[13px] text-base-content/45">PDF, DOC ou DOCX · máx. 10 MB</div>
        </div>
    );
}

function JobSidebar({vacancy}: { vacancy: PublicJobVacancy }) {
    const salaryLabel = formatSalaryRange(vacancy.salary, vacancy.salaryMax);
    const publishedLabel = formatPublishedLabel(vacancy.publishedAt);
    const modalityLabel = vacancy.workModality
        ? JOB_VACANCY_WORK_MODALITY_LABELS[vacancy.workModality]
        : null;
    const contractLabel = vacancy.contractType
        ? JOB_VACANCY_CONTRACT_TYPE_LABELS[vacancy.contractType]
        : null;
    const seniorityLabel = vacancy.seniorityLevel
        ? JOB_VACANCY_SENIORITY_LABELS[vacancy.seniorityLevel]
        : null;
    const requirements = splitLines(vacancy.requirements);
    const benefits = splitLines(vacancy.benefits);
    const locationChip = [vacancy.location, modalityLabel].filter(Boolean).join(" · ");
    const contractChip = [contractLabel, vacancy.workSchedule].filter(Boolean).join(" · ");

    const chips = [
        locationChip ? {label: locationChip} : null,
        contractChip ? {label: contractChip} : null,
        salaryLabel ? {label: salaryLabel} : null,
        seniorityLabel ? {label: seniorityLabel} : null,
        publishedLabel ? {label: `Publicada em ${publishedLabel}`} : null,
    ].filter(Boolean) as { label: string }[];

    return (
        <aside
            className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col bg-primary px-8 py-10 text-primary-content lg:sticky lg:top-14 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
            <div
                className="mb-7 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-white">
                <span className="size-1.5 rounded-full bg-success"/>
                VAGA ABERTA
            </div>

            <div className="flex items-center gap-4">
                <div className="flex size-13 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                    <BriefcaseBusiness className="size-6 text-white/90"/>
                </div>
                <div className="">
                    {vacancy.department ? (
                        <p className="text-xs font-medium text-white/65">{vacancy.department}</p>
                    ) : null}
                    <h1 className="text-2xl font-extrabold leading-tight text-white">{vacancy.jobTitle}</h1>
                </div>

            </div>


            {seniorityLabel && !chips.some((chip) => chip.label === seniorityLabel) ? (
                <p className="mb-7 text-sm text-white/75">{seniorityLabel}</p>
            ) : (
                <div className="mb-7"/>
            )}

            {chips.length > 0 ? (
                <div className="mb-8 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <span
                            key={chip.label}
                            className="rounded-md border border-white/20 bg-white/15 px-2.5 py-1 text-xs text-white"
                        >
                            {chip.label}
                        </span>
                    ))}
                </div>
            ) : null}

            {vacancy.description ? (
                <div className="mb-7 border-t border-white/20 pt-7">
                    <p className="mb-3 text-xs font-bold tracking-[0.08em] text-white/50">SOBRE A VAGA</p>
                    <MarkdownContent
                        value={vacancy.description}
                        className="text-[13.5px] text-white/85 [&_a]:text-white [&_blockquote]:border-white/40 [&_blockquote]:text-white/65 [&_code]:bg-white/15 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_hr]:border-white/20 [&_pre]:bg-white/10 [&_strong]:text-white"
                    />
                </div>
            ) : null}

            {requirements.length > 0 ? (
                <div className="mb-7">
                    <p className="mb-3.5 text-xs font-bold tracking-[0.08em] text-white/50">REQUISITOS</p>
                    <div className="flex flex-col gap-2.5">
                        {requirements.map((item) => (
                            <div key={item} className="flex items-start gap-2.5">
                                <span
                                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                                    <Check className="size-2 text-white" strokeWidth={3}/>
                                </span>
                                <span className="text-[13px] leading-snug text-white/80">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {benefits.length > 0 ? (
                <div className="mb-7">
                    <p className="mb-3.5 text-xs font-bold tracking-[0.08em] text-white/50">BENEFÍCIOS</p>
                    <div className="flex flex-wrap gap-2">
                        {benefits.map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/90"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {(vacancy.activities || vacancy.assignments) && (
                <div className="mb-7 space-y-5">
                    {vacancy.activities ? (
                        <div>
                            <p className="mb-2 text-xs font-bold tracking-[0.08em] text-white/50">ATIVIDADES</p>
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/80">
                                {vacancy.activities}
                            </p>
                        </div>
                    ) : null}
                    {vacancy.assignments ? (
                        <div>
                            <p className="mb-2 text-xs font-bold tracking-[0.08em] text-white/50">ATRIBUIÇÕES</p>
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/80">
                                {vacancy.assignments}
                            </p>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="mt-auto border-t border-white/15 pt-6 text-[11px] leading-relaxed text-white/45">
                {vacancy.code != null ? (
                    <>
                        Código da vaga:{" "}
                        <strong className="text-white/70">#{vacancy.code}</strong>
                        <br/>
                    </>
                ) : null}
                {publishedLabel ? <>Publicada em {publishedLabel}</> : null}
            </div>
        </aside>
    );
}

export function CareersApplyClient({slug}: { slug: string }) {
    const [form, setForm] = useState<ApplyFormState>(emptyForm);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const vacancyQuery = useQuery({
        queryKey: ["public-careers", slug],
        queryFn: () => publicCareersService.getBySlug(slug),
        retry: false,
    });

    const applyMutation = useMutation({
        mutationFn: ({
                         payload,
                         resume,
                     }: {
            payload: PublicJobApplicationPayload;
            resume: File | null;
        }) => publicCareersService.apply(slug, payload, resume),
        onSuccess: () => {
            setSubmitted(true);
            setError(null);
            setForm(emptyForm());
            setResumeFile(null);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível enviar a candidatura.",
            });
            setError(ex.displayMessage);
        },
    });

    const stateItems = useMemo(
        () => BRAZIL_STATE_CODES.map((code) => ({value: code, label: code})),
        [],
    );
    const referralItems = useMemo(
        () => CAREERS_REFERRAL_OPTIONS.map((item) => ({value: item.value, label: item.label})),
        [],
    );

    const completedSections = [
        form.firstName && form.lastName && form.email && form.cpf,
        form.experiences.some((item) => item.companyName && item.jobTitle),
        resumeFile || form.coverLetter,
    ].filter(Boolean).length;

    const update = <K extends keyof ApplyFormState>(field: K, value: ApplyFormState[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    const updateExperience = (id: string, patch: Partial<CareersExperienceForm>) => {
        setForm((prev) => ({
            ...prev,
            experiences: prev.experiences.map((item) => (item.id === id ? {...item, ...patch} : item)),
        }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError("Informe nome e sobrenome.");
            return;
        }
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError("Informe um e-mail válido.");
            return;
        }
        if (!digitsOnly(form.cpf)) {
            setError("Informe o CPF.");
            return;
        }

        const experiences = form.experiences
            .filter((item) => item.companyName.trim() && item.jobTitle.trim())
            .map((item) => {
                const startDate = monthYearToIsoDate(item.startMonth, item.startYear);
                if (!startDate) return null;
                return {
                    companyName: item.companyName.trim(),
                    jobTitle: item.jobTitle.trim(),
                    startDate,
                    endDate: item.currentJob
                        ? undefined
                        : monthYearToIsoDate(item.endMonth, item.endYear),
                    currentJob: item.currentJob,
                    description: item.description.trim() || undefined,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item != null);

        applyMutation.mutate({
            payload: {
                fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
                cpf: digitsOnly(form.cpf),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                city: form.city.trim() || undefined,
                stateCode: form.stateCode || undefined,
                linkedinUrl: form.linkedinUrl.trim() || undefined,
                portfolioUrl: form.portfolioUrl.trim() || undefined,
                coverLetter: form.coverLetter.trim() || undefined,
                referralSource: form.referralSource || undefined,
                experiences,
            },
            resume: resumeFile,
        });
    };

    if (vacancyQuery.isLoading) {
        return (
            <div className="min-h-screen bg-base-200 p-8">
                <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[460px_1fr]">
                    <div className="skeleton-shimmer h-[70vh] rounded-2xl"/>
                    <div className="grid gap-3">
                        {Array.from({length: 4}).map((_, index) => (
                            <div key={index} className="skeleton-shimmer h-28 rounded-xl"/>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (vacancyQuery.isError || !vacancyQuery.data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
                <div
                    className="w-full max-w-lg rounded-2xl border border-base-content/10 bg-base-100 p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-base-content">Vaga não disponível</h1>
                    <p className="mt-2 text-sm text-base-content/60">
                        {ExceptionCapture.displayMessage(
                            vacancyQuery.error,
                            "Esta vaga não foi encontrada ou não está publicada.",
                        )}
                    </p>
                </div>
            </div>
        );
    }

    const vacancy = vacancyQuery.data;

    return (
        <div className="min-h-screen bg-base-200">
            <header
                className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-base-content/10 bg-base-100 px-6 sm:px-8">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/brand/gommo-logo-blue.svg"
                        alt="Gommo"
                        className="h-7 w-auto"
                        draggable={false}
                    />
                    <span className="text-sm font-bold text-base-content">Carreiras</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden text-[13px] text-base-content/45 sm:inline">
                        {completedSections}/3 seções preenchidas
                    </span>
                    <span
                        className={clsx(
                            "size-2 rounded-full",
                            completedSections === 3 ? "bg-success" : "bg-warning",
                        )}
                    />
                    <ThemeToggle/>
                </div>
            </header>

            <div className="grid min-h-[calc(100vh-3.5rem)] items-start lg:grid-cols-[520px_1fr]">
                <JobSidebar vacancy={vacancy}/>

                <div className="px-5 py-10 sm:px-10 lg:px-10 lg:pb-16">
                    <div className="mb-8">
                        <h2 className="mb-2 text-[22px] font-extrabold text-base-content">Sua candidatura</h2>
                        <p className="mb-5 text-sm leading-relaxed text-base-content/55">
                            Preencha os campos abaixo. Campos com{" "}
                            <span className="font-semibold text-primary">*</span> são obrigatórios.
                        </p>
                        <ProgressBar step={completedSections} total={3}/>
                    </div>

                    {submitted ? (
                        <div
                            className="rounded-xl border border-base-content/10 bg-base-100 px-6 py-20 text-center shadow-sm">
                            <div
                                className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full bg-primary text-primary-content shadow-[0_8px_32px_color-mix(in_oklab,var(--color-primary)_30%,transparent)]">
                                <Check className="size-8" strokeWidth={2.5}/>
                            </div>
                            <h3 className="mb-3 text-[26px] font-extrabold text-base-content">
                                Candidatura enviada!
                            </h3>
                            <p className="mx-auto mb-8 max-w-sm text-[15px] leading-relaxed text-base-content/55">
                                Recebemos suas informações. Nossa equipe analisará seu perfil e entrará em
                                contato em breve.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setForm(emptyForm());
                                    setSubmitted(false);
                                }}
                            >
                                Nova candidatura
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-3.5">
                            <section
                                className="rounded-xl border border-base-content/10 bg-base-100 p-[26px] shadow-sm">
                                <SectionHeader
                                    number="1"
                                    title="Informações pessoais"
                                    subtitle="Dados de identificação e contato"
                                />
                                <div className="grid gap-3.5 sm:grid-cols-2">
                                    <InputString
                                        label="Nome"
                                        required
                                        value={form.firstName}
                                        onValueChange={(value) => update("firstName", value)}
                                        placeholder="Seu nome"
                                    />
                                    <InputString
                                        label="Sobrenome"
                                        required
                                        value={form.lastName}
                                        onValueChange={(value) => update("lastName", value)}
                                        placeholder="Seu sobrenome"
                                    />
                                    <InputString
                                        label="E-mail"
                                        required
                                        value={form.email}
                                        onValueChange={(value) => update("email", value)}
                                        placeholder="seu@email.com"
                                    />
                                    <InputPhone
                                        label="Telefone / WhatsApp"
                                        value={form.phone}
                                        onValueChange={(value) => update("phone", value)}
                                    />
                                    <InputCPF
                                        label="CPF"
                                        required
                                        value={form.cpf}
                                        onValueChange={(value) => update("cpf", value)}
                                    />
                                    <InputString
                                        label="Cidade"
                                        value={form.city}
                                        onValueChange={(value) => update("city", value)}
                                        placeholder="São Paulo"
                                    />
                                    <InputSelect
                                        label="Estado"
                                        items={stateItems}
                                        value={form.stateCode}
                                        onValueChange={(value) => update("stateCode", value)}
                                        placeholder="Selecione"
                                        clearable
                                    />
                                    <InputString
                                        label="LinkedIn"
                                        value={form.linkedinUrl}
                                        onValueChange={(value) => update("linkedinUrl", value)}
                                        placeholder="linkedin.com/in/seu-perfil"
                                    />
                                    <InputString
                                        label="Portfólio / GitHub"
                                        value={form.portfolioUrl}
                                        onValueChange={(value) => update("portfolioUrl", value)}
                                        placeholder="github.com/usuario"
                                        wrapperClassName="sm:col-span-2"
                                    />
                                </div>
                            </section>

                            <section
                                className="rounded-xl border border-base-content/10 bg-base-100 p-[26px] shadow-sm">
                                <SectionHeader
                                    number="2"
                                    title="Experiências profissionais"
                                    subtitle="Adicione suas experiências mais relevantes"
                                />
                                {form.experiences.map((exp, index) => (
                                    <ExperienceCard
                                        key={exp.id}
                                        exp={exp}
                                        index={index}
                                        onChange={updateExperience}
                                        onRemove={(id) =>
                                            update(
                                                "experiences",
                                                form.experiences.filter((item) => item.id !== id),
                                            )
                                        }
                                        isOnly={form.experiences.length === 1}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        update("experiences", [
                                            ...form.experiences,
                                            createEmptyCareersExperience(),
                                        ])
                                    }
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-base-content/25 px-[18px] py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
                                >
                                    <Plus className="size-4"/>
                                    Adicionar experiência
                                </button>
                            </section>

                            <section
                                className="rounded-xl border border-base-content/10 bg-base-100 p-[26px] shadow-sm">
                                <SectionHeader
                                    number="3"
                                    title="Currículo e carta de apresentação"
                                    subtitle="Documentos complementares"
                                />
                                <div className="mb-5 grid gap-1.5">
                                    <span className="text-[13px] font-medium text-base-content/80">Currículo</span>
                                    <ResumeUpload file={resumeFile} onChange={setResumeFile}/>
                                </div>
                                <label className="mb-4 grid gap-1.5">
                                    <span className="text-[13px] font-medium text-base-content/80">
                                        Carta de apresentação
                                    </span>
                                    <textarea
                                        rows={5}
                                        value={form.coverLetter}
                                        onChange={(event) => update("coverLetter", event.target.value)}
                                        placeholder="Conte por que você é um(a) excelente candidato(a) para esta vaga..."
                                        className="w-full resize-y rounded-lg border border-base-content/15 bg-base-100 px-3.5 py-3 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]"
                                    />
                                </label>
                                <InputSelect
                                    label="Como conheceu a vaga?"
                                    items={referralItems}
                                    value={form.referralSource}
                                    onValueChange={(value) => update("referralSource", value)}
                                    placeholder="Selecione uma opção"
                                    clearable
                                />
                            </section>

                            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <p className="max-w-sm text-xs leading-relaxed text-base-content/45">
                                    Ao enviar, você autoriza o uso dos dados para fins de recrutamento.
                                </p>
                                <Button type="submit" loading={applyMutation.isPending}>
                                    Enviar candidatura
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
