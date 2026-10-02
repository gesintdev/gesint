"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Check,
    ChevronDown,
    FileText,
    Link2,
    MessageCircle,
    Plus,
    Sparkles,
    Upload,
} from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, type DragEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
    careersDisplayName,
    CareersSiteFooter,
    CareersSiteHeader,
    CareersThemeScope,
} from "@/modules/careers/shared/components/CareersSiteChrome";
import type { CareersApplicationPayload, CareersVacancy } from "@/modules/careers/shared/dto/careers.dto";
import {
    formatDateLabel,
    formatSalaryRange,
    isClosingSoon,
    splitLines,
} from "@/modules/careers/shared/lib/careers-format";
import {
    CAREERS_CONTRACT_TYPE_LABELS,
    CAREERS_SENIORITY_LABELS,
    CAREERS_WORK_MODALITY_LABELS,
} from "@/modules/careers/shared/lib/careers-labels";
import { CareersPrivacyNoticeModal } from "@/modules/careers/site/components/CareersPrivacyNoticeModal";
import {
    CAREERS_MONTHS,
    CAREERS_REFERRAL_OPTIONS,
    CAREERS_STATE_CODES,
    CAREERS_YEARS,
    type CareersExperienceForm,
    createEmptyExperience,
    invalidResumeMessage,
    isValidEmail,
    monthYearToIsoDate,
    phoneDigits,
    referralFromSearch,
} from "@/modules/careers/site/lib/careers-application.form";
import { careersSiteKeys, careersSiteService } from "@/modules/careers/site/services/careers-site.service";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import { Button } from "@/shared/components/ui/Button";
import { InputCheckbox, InputCurrency, InputPhone, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";
import { ExceptionCapture } from "@/shared/exceptions";

type ApplyFormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    stateCode: string;
    linkedinUrl: string;
    portfolioUrl: string;
    coverLetter: string;
    referralSource: string;
    salaryExpectation: string;
    experiences: CareersExperienceForm[];
    privacyConsent: boolean;
    talentPoolConsent: boolean;
};

function emptyForm(referralSource = ""): ApplyFormState {
    return {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        stateCode: "",
        linkedinUrl: "",
        portfolioUrl: "",
        coverLetter: "",
        referralSource,
        salaryExpectation: "",
        experiences: [createEmptyExperience()],
        privacyConsent: false,
        talentPoolConsent: false,
    };
}

const TEXTAREA_CLASS =
    "w-full resize-y rounded-lg border border-base-content/15 bg-base-100 px-3.5 py-3 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]";

function ProgressBar({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, index) => (
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

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
    return (
        <div className="mb-7 flex items-start gap-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--careers-radius)] bg-primary text-sm font-bold text-primary-content">
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
    const monthItems = CAREERS_MONTHS.map((month) => ({ value: month, label: month }));
    const yearItems = CAREERS_YEARS.map((year) => ({ value: year, label: year }));

    return (
        <div className="mb-3 overflow-hidden rounded-[var(--careers-radius)] border border-base-content/10">
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
                        <BriefcaseBusiness className="size-3.5 text-primary" />
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
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-base-content/50 hover:text-error"
                            onClick={() => onRemove(exp.id)}
                        >
                            Remover
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded((value) => !value)}
                        aria-label={expanded ? "Recolher experiência" : "Expandir experiência"}
                        leftIcon={
                            <ChevronDown
                                className={clsx("size-4 text-base-content/45 transition-transform", expanded && "rotate-180")}
                            />
                        }
                    />
                </div>
            </div>

            {expanded ? (
                <div className="grid gap-4 border-t border-base-content/5 px-[18px] py-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputString
                            label="Empresa"
                            required
                            value={exp.companyName}
                            onValueChange={(value) => onChange(exp.id, { companyName: value })}
                            placeholder="Nome da empresa"
                        />
                        <InputString
                            label="Cargo"
                            required
                            value={exp.jobTitle}
                            onValueChange={(value) => onChange(exp.id, { jobTitle: value })}
                            placeholder="Seu cargo"
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <InputSelect
                            label="Mês início"
                            items={monthItems}
                            value={exp.startMonth}
                            onValueChange={(value) => onChange(exp.id, { startMonth: value })}
                            placeholder="Mês"
                        />
                        <InputSelect
                            label="Ano início"
                            items={yearItems}
                            value={exp.startYear}
                            onValueChange={(value) => onChange(exp.id, { startYear: value })}
                            placeholder="Ano"
                        />
                        <InputSelect
                            label="Mês fim"
                            items={monthItems}
                            value={exp.endMonth}
                            onValueChange={(value) => onChange(exp.id, { endMonth: value })}
                            placeholder="Mês"
                            disabled={exp.currentJob}
                        />
                        <InputSelect
                            label="Ano fim"
                            items={yearItems}
                            value={exp.endYear}
                            onValueChange={(value) => onChange(exp.id, { endYear: value })}
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
                        <span className="text-[13px] font-medium text-base-content/80">Descrição das atividades</span>
                        <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(event) => onChange(exp.id, { description: event.target.value })}
                            placeholder="Descreva suas principais responsabilidades e conquistas..."
                            className={TEXTAREA_CLASS}
                        />
                    </label>
                </div>
            ) : null}
        </div>
    );
}

function ResumeUpload({ file, onChange }: { file: File | null; onChange: (file: File | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const acceptFile = (next: File | undefined) => {
        if (!next) return;
        const invalid = invalidResumeMessage(next);
        if (invalid) {
            setFileError(invalid);
            onChange(null);
            return;
        }
        setFileError(null);
        onChange(next);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        acceptFile(event.dataTransfer.files[0]);
    };

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        acceptFile(event.target.files?.[0]);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (file) {
        return (
            <div className="flex items-center justify-between rounded-[var(--careers-radius)] border border-primary bg-primary/5 px-[18px] py-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-content">
                        <FileText className="size-4" />
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
                "cursor-pointer rounded-[var(--careers-radius)] border-2 border-dashed px-6 py-9 text-center transition-colors",
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
            <div className="mx-auto mb-3.5 flex size-12 items-center justify-center rounded-[var(--careers-radius)] bg-primary/10">
                <Upload className="size-5 text-primary" />
            </div>
            <div className="mb-1.5 text-[15px] font-semibold text-base-content">
                Arraste seu currículo ou clique para selecionar
            </div>
            <div className="text-[13px] text-base-content/45">PDF, DOC ou DOCX · máx. 10 MB</div>
            {fileError ? <p className="mt-3 text-sm text-error">{fileError}</p> : null}
        </div>
    );
}

function ShareActions({ slug, jobTitle }: { slug: string; jobTitle: string }) {
    const [copied, setCopied] = useState(false);
    const shareUrl = (origin: string) =>
        `${typeof window !== "undefined" ? window.location.origin : ""}/careers/${encodeURIComponent(slug)}?origem=${origin}`;

    return (
        <div className="flex flex-wrap gap-2">
            <a
                href={`https://wa.me/?text=${encodeURIComponent(`Vaga: ${jobTitle} — ${shareUrl("whatsapp")}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
                <MessageCircle className="size-3.5" strokeWidth={2} />
                Compartilhar no WhatsApp
            </a>
            <button
                type="button"
                onClick={() => {
                    void navigator.clipboard?.writeText(shareUrl("site")).then(() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                    });
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
                {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Link2 className="size-3.5" strokeWidth={2} />}
                {copied ? "Link copiado" : "Copiar link"}
            </button>
        </div>
    );
}

function JobSidebar({ vacancy }: { vacancy: CareersVacancy }) {
    const salaryLabel = formatSalaryRange(vacancy.salary, vacancy.salaryMax);
    const publishedLabel = formatDateLabel(vacancy.publishedAt);
    const closingLabel = formatDateLabel(vacancy.expectedCompletionDate);
    const closingSoon = isClosingSoon(vacancy.expectedCompletionDate);
    const modalityLabel = vacancy.workModality ? CAREERS_WORK_MODALITY_LABELS[vacancy.workModality] : null;
    const contractLabel = vacancy.contractType ? CAREERS_CONTRACT_TYPE_LABELS[vacancy.contractType] : null;
    const seniorityLabel = vacancy.seniorityLevel ? CAREERS_SENIORITY_LABELS[vacancy.seniorityLevel] : null;
    const requirements = splitLines(vacancy.requirements);
    const benefits = splitLines(vacancy.benefits);
    const locationChip = [vacancy.location, modalityLabel].filter(Boolean).join(" · ");
    const contractChip = [contractLabel, vacancy.workSchedule].filter(Boolean).join(" · ");

    const chips = [locationChip, contractChip, salaryLabel, seniorityLabel].filter(Boolean) as string[];

    return (
        <aside className="flex h-full flex-col bg-primary px-6 py-10 text-primary-content sm:px-8 lg:sticky lg:top-14 lg:max-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
            <Link
                href="/careers"
                className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs font-medium opacity-75 hover:opacity-100"
            >
                <ArrowLeft className="size-3.5" strokeWidth={2} />
                Todas as vagas
            </Link>
            <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.08em]">
                    <span className="size-1.5 rounded-full bg-success" />
                    VAGA ABERTA
                </span>
                {closingSoon && closingLabel ? (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                        Inscrições até {closingLabel}
                    </span>
                ) : null}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex size-13 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                    <BriefcaseBusiness className="size-6 opacity-90" />
                </div>
                <div>
                    {vacancy.department ? <p className="text-xs font-medium opacity-65">{vacancy.department}</p> : null}
                    <h1 className="text-2xl font-extrabold leading-tight">{vacancy.jobTitle}</h1>
                </div>
            </div>

            {chips.length > 0 ? (
                <div className="mb-6 mt-7 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <span key={chip} className="rounded-md border border-white/20 bg-white/15 px-2.5 py-1 text-xs">
                            {chip}
                        </span>
                    ))}
                </div>
            ) : (
                <div className="mb-6" />
            )}

            <div className="mb-7">
                <ShareActions slug={vacancy.slug} jobTitle={vacancy.jobTitle} />
            </div>

            {vacancy.description ? (
                <div className="mb-7 border-t border-white/20 pt-7">
                    <p className="mb-3 text-xs font-bold tracking-[0.08em] opacity-50">SOBRE A VAGA</p>
                    <MarkdownContent
                        value={vacancy.description}
                        className="text-[13.5px] text-current opacity-90 [&_a]:text-current [&_blockquote]:border-white/40 [&_code]:bg-white/15 [&_h1]:text-current [&_h2]:text-current [&_h3]:text-current [&_hr]:border-white/20 [&_pre]:bg-white/10 [&_strong]:text-current"
                    />
                </div>
            ) : null}

            {requirements.length > 0 ? (
                <div className="mb-7">
                    <p className="mb-3.5 text-xs font-bold tracking-[0.08em] opacity-50">REQUISITOS</p>
                    <div className="flex flex-col gap-2.5">
                        {requirements.map((item) => (
                            <div key={item} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                                    <Check className="size-2" strokeWidth={3} />
                                </span>
                                <span className="text-[13px] leading-snug opacity-80">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {benefits.length > 0 ? (
                <div className="mb-7">
                    <p className="mb-3.5 text-xs font-bold tracking-[0.08em] opacity-50">BENEFÍCIOS</p>
                    <div className="flex flex-wrap gap-2">
                        {benefits.map((item) => (
                            <span key={item} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {vacancy.activities || vacancy.assignments ? (
                <div className="mb-7 space-y-5">
                    {vacancy.activities ? (
                        <div>
                            <p className="mb-2 text-xs font-bold tracking-[0.08em] opacity-50">ATIVIDADES</p>
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed opacity-80">{vacancy.activities}</p>
                        </div>
                    ) : null}
                    {vacancy.assignments ? (
                        <div>
                            <p className="mb-2 text-xs font-bold tracking-[0.08em] opacity-50">ATRIBUIÇÕES</p>
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed opacity-80">{vacancy.assignments}</p>
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="mt-auto border-t border-white/15 pt-6 text-[11px] leading-relaxed opacity-50">
                {vacancy.code != null ? (
                    <>
                        Código da vaga: <strong>#{vacancy.code}</strong>
                        <br />
                    </>
                ) : null}
                {publishedLabel ? <>Publicada em {publishedLabel}</> : null}
            </div>
        </aside>
    );
}

export function CareersVacancyPageClient({ slug, initialData }: { slug: string; initialData?: CareersVacancy | null }) {
    const [form, setForm] = useState<ApplyFormState>(() => emptyForm());
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);

    useEffect(() => {
        const referral = referralFromSearch(window.location.search);
        if (referral) {
            setForm((prev) => (prev.referralSource ? prev : { ...prev, referralSource: referral }));
        }
    }, []);

    const vacancyQuery = useQuery({
        queryKey: careersSiteKeys.vacancy(slug),
        queryFn: () => careersSiteService.getVacancy(slug),
        initialData: initialData ?? undefined,
        retry: false,
    });

    const applyMutation = useMutation({
        mutationFn: ({ payload, resume }: { payload: CareersApplicationPayload; resume: File | null }) =>
            careersSiteService.apply(slug, payload, resume),
        onSuccess: () => {
            setSubmitted(true);
            setError(null);
            setForm(emptyForm());
            setResumeFile(null);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível enviar a candidatura agora. Tente novamente em instantes.",
            });
            setError(ex.displayMessage);
        },
    });

    const stateItems = useMemo(() => CAREERS_STATE_CODES.map((code) => ({ value: code, label: code })), []);
    const referralItems = useMemo(
        () => CAREERS_REFERRAL_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
        [],
    );

    const completedSections = [
        form.firstName && form.lastName && isValidEmail(form.email) && phoneDigits(form.phone).length >= 10,
        form.experiences.some((item) => item.companyName && item.jobTitle && item.startMonth && item.startYear) ||
            Boolean(resumeFile),
        form.privacyConsent,
    ].filter(Boolean).length;

    const update = <K extends keyof ApplyFormState>(field: K, value: ApplyFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateExperience = (id: string, patch: Partial<CareersExperienceForm>) => {
        setForm((prev) => ({
            ...prev,
            experiences: prev.experiences.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError("Informe nome e sobrenome.");
            return;
        }
        if (!isValidEmail(form.email)) {
            setError("Informe um e-mail válido.");
            return;
        }
        const phone = phoneDigits(form.phone);
        if (phone.length < 10 || phone.length > 13) {
            setError("Informe um telefone ou WhatsApp com DDD.");
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
                    endDate: item.currentJob ? undefined : monthYearToIsoDate(item.endMonth, item.endYear),
                    currentJob: item.currentJob,
                    description: item.description.trim() || undefined,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item != null);

        if (!resumeFile && experiences.length === 0) {
            setError("Envie um currículo ou informe ao menos uma experiência profissional.");
            return;
        }
        const resumeError = invalidResumeMessage(resumeFile);
        if (resumeError) {
            setError(resumeError);
            return;
        }
        if (!form.privacyConsent) {
            setError("Para se candidatar, confirme que leu o aviso de privacidade deste processo.");
            return;
        }

        const salaryExpectation = form.salaryExpectation.trim() ? Number(form.salaryExpectation) : undefined;

        applyMutation.mutate({
            payload: {
                fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                city: form.city.trim() || undefined,
                stateCode: form.stateCode || undefined,
                linkedinUrl: form.linkedinUrl.trim() || undefined,
                portfolioUrl: form.portfolioUrl.trim() || undefined,
                coverLetter: form.coverLetter.trim() || undefined,
                referralSource: form.referralSource || undefined,
                salaryExpectation:
                    salaryExpectation != null && !Number.isNaN(salaryExpectation) ? salaryExpectation : undefined,
                experiences,
                privacyConsent: form.privacyConsent,
                talentPoolConsent: form.talentPoolConsent,
            },
            resume: resumeFile,
        });
    };

    if (vacancyQuery.isLoading) {
        return (
            <div className="min-h-screen bg-base-200 p-8">
                <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[460px_1fr]">
                    <div className="skeleton-shimmer h-[70vh] rounded-2xl" />
                    <div className="grid gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="skeleton-shimmer h-28 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (vacancyQuery.isError || !vacancyQuery.data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
                <div className="w-full max-w-lg rounded-2xl border border-base-content/10 bg-base-100 p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-base-content">Vaga não disponível</h1>
                    <p className="mt-2 text-sm text-base-content/60">
                        {ExceptionCapture.displayMessage(
                            vacancyQuery.error,
                            "Esta vaga não foi encontrada ou não está mais aberta.",
                        )}
                    </p>
                    <Link href="/careers" className="mt-6 inline-flex text-sm font-semibold text-primary">
                        Ver todas as vagas
                    </Link>
                </div>
            </div>
        );
    }

    const vacancy = vacancyQuery.data;
    const privacy = vacancy.privacy;
    const organization = careersDisplayName(vacancy.branding, vacancy.organizationName);

    return (
        <CareersThemeScope branding={vacancy.branding} className="min-h-screen">
            <CareersSiteHeader
                branding={vacancy.branding}
                organizationName={vacancy.organizationName}
                actions={
                    <>
                        <span className="hidden text-[13px] text-base-content/45 sm:inline">
                            {completedSections}/3 seções preenchidas
                        </span>
                        <span
                            className={clsx("size-2 rounded-full", completedSections === 3 ? "bg-success" : "bg-warning")}
                        />
                        <ThemeToggle />
                    </>
                }
            />

            <div className="grid items-start lg:grid-cols-[520px_1fr]">
                <JobSidebar vacancy={vacancy} />

                <div className="px-5 py-10 sm:px-10 lg:pb-16">
                    <div className="mb-8">
                        <h2 className="mb-2 text-[22px] font-extrabold text-base-content">Sua candidatura</h2>
                        <p className="mb-5 text-sm leading-relaxed text-base-content/55">
                            Leva poucos minutos. Campos com <span className="font-semibold text-primary">*</span> são
                            obrigatórios — não pedimos CPF nem data de nascimento nesta etapa.
                        </p>
                        <ProgressBar step={completedSections} total={3} />
                    </div>

                    {submitted ? (
                        <div className="rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 px-6 py-20 text-center shadow-sm">
                            <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full bg-primary text-primary-content">
                                <Check className="size-8" strokeWidth={2.5} />
                            </div>
                            <h3 className="mb-3 text-[26px] font-extrabold text-base-content">Candidatura recebida!</h3>
                            <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-base-content/55">
                                Obrigado pelo interesse na {organization}. O time de recrutamento vai analisar seu
                                perfil e entrará em contato pelo e-mail ou telefone informados.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Link
                                    href="/careers"
                                    className="inline-flex h-9 items-center rounded-lg border border-base-content/15 px-4 text-sm font-medium text-base-content hover:bg-base-200"
                                >
                                    Ver outras vagas
                                </Link>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setForm(emptyForm());
                                        setSubmitted(false);
                                    }}
                                >
                                    Nova candidatura
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-3.5">
                            <section className="rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-[26px] shadow-sm">
                                <SectionHeader number="1" title="Seus dados" subtitle="Só o necessário para falarmos com você" />
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
                                        required
                                        value={form.phone}
                                        onValueChange={(value) => update("phone", value)}
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
                                    />
                                    <InputCurrency
                                        label="Pretensão salarial"
                                        value={form.salaryExpectation}
                                        onValueChange={(value) => update("salaryExpectation", value)}
                                        emitAsDecimal
                                        placeholder="Opcional"
                                    />
                                </div>
                            </section>

                            <section className="rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-[26px] shadow-sm">
                                <SectionHeader
                                    number="2"
                                    title="Currículo e experiências"
                                    subtitle="Anexe o currículo ou informe ao menos uma experiência completa"
                                />
                                <div className="mb-6 grid gap-1.5">
                                    <span className="text-[13px] font-medium text-base-content/80">
                                        Currículo <span className="font-normal text-base-content/45">(recomendado)</span>
                                    </span>
                                    <ResumeUpload file={resumeFile} onChange={setResumeFile} />
                                </div>
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
                                    onClick={() => update("experiences", [...form.experiences, createEmptyExperience()])}
                                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-base-content/25 px-[18px] py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
                                >
                                    <Plus className="size-4" />
                                    Adicionar experiência
                                </button>
                                <label className="mb-4 mt-6 grid gap-1.5">
                                    <span className="text-[13px] font-medium text-base-content/80">Carta de apresentação</span>
                                    <textarea
                                        rows={4}
                                        value={form.coverLetter}
                                        onChange={(event) => update("coverLetter", event.target.value)}
                                        placeholder="Conte por que você é um(a) excelente candidato(a) para esta vaga..."
                                        className={TEXTAREA_CLASS}
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

                            <section className="rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-[26px] shadow-sm">
                                <SectionHeader number="3" title="Privacidade" subtitle="Você decide como usamos seus dados" />
                                <div className="mb-5 flex gap-3 rounded-[var(--careers-radius)] bg-base-200/70 px-4 py-3">
                                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} />
                                    <p className="text-[13px] leading-relaxed text-base-content/70">
                                        Usamos inteligência artificial para ajudar o recrutador a ler currículos. A
                                        decisão sobre a sua candidatura é sempre de uma pessoa, e você pode pedir revisão.
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <InputCheckbox
                                        size="sm"
                                        checked={form.privacyConsent}
                                        onCheckedChange={(next) => update("privacyConsent", next)}
                                        labelClassName="text-[13px] leading-relaxed text-base-content/80"
                                        label={
                                            <span>
                                                Li o{" "}
                                                <button
                                                    type="button"
                                                    className="font-semibold text-primary underline-offset-2 hover:underline"
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        setPrivacyOpen(true);
                                                    }}
                                                >
                                                    aviso de privacidade
                                                </button>{" "}
                                                e autorizo o uso dos meus dados neste processo seletivo.{" "}
                                                <span className="text-primary">*</span>
                                            </span>
                                        }
                                    />
                                    <InputCheckbox
                                        size="sm"
                                        checked={form.talentPoolConsent}
                                        onCheckedChange={(next) => update("talentPoolConsent", next)}
                                        labelClassName="text-[13px] leading-relaxed text-base-content/80"
                                        label={`Quero entrar no banco de talentos da ${organization} por ${privacy.talentPoolMonths} meses para ser lembrado(a) em outras vagas (opcional).`}
                                    />
                                </div>
                            </section>

                            {error ? (
                                <p role="alert" className="text-sm font-medium text-error">
                                    {error}
                                </p>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <p className="max-w-sm text-xs leading-relaxed text-base-content/45">
                                    Aviso de privacidade versão {privacy.version}. Você pode revogar o consentimento a
                                    qualquer momento pelo contato do recrutador.
                                </p>
                                <Button type="submit" loading={applyMutation.isPending}>
                                    Enviar candidatura
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <CareersSiteFooter branding={vacancy.branding} organizationName={vacancy.organizationName} />
            <CareersPrivacyNoticeModal
                open={privacyOpen}
                notice={privacy.notice}
                version={privacy.version}
                onClose={() => setPrivacyOpen(false)}
            />
        </CareersThemeScope>
    );
}
