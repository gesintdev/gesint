"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Circle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { workScheduleService } from "@/modules/cfg/settings/workschedule/services/work-schedule.service";
import { jobPositionSalaryTableService } from "@/modules/dp/organization/jobposition/salarytable/services/job-position-salary-table.service";
import { CONTRACT_TYPE_ITEMS } from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import type {
    AdmissionContractType,
    CandidateAcceptance,
    JobVacancyApplicationHireResponse,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application-hire.dto";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { Button } from "@/shared/components/ui/Button";
import {
    InputCurrency,
    InputDate,
    InputSelect,
    InputString,
    type SelectItem,
} from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

type HireProposalModalProps = {
    open: boolean;
    applicationId: string | null;
    columnKey: string;
    onClose: () => void;
    onSuccess?: (result: JobVacancyApplicationHireResponse) => void;
};

const ACCEPTANCE_ITEMS: SelectItem[] = [
    { value: "PENDING", label: "Pendente" },
    { value: "ACCEPTED", label: "Aceito" },
    { value: "DECLINED", label: "Recusado" },
];

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

function parseSalary(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
}

export function HireProposalModal({
    open,
    applicationId,
    columnKey,
    onClose,
    onSuccess,
}: HireProposalModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [contractType, setContractType] = useState<AdmissionContractType>("CLT");
    const [expectedStartDate, setExpectedStartDate] = useState("");
    const [baseSalary, setBaseSalary] = useState("");
    const [workScheduleId, setWorkScheduleId] = useState("");
    const [candidateAcceptance, setCandidateAcceptance] = useState<CandidateAcceptance>("PENDING");
    const [cpf, setCpf] = useState("");

    const previewQuery = useQuery({
        queryKey: [...jobVacancyApplicationKeys.all, "hire-preview", applicationId ?? ""],
        queryFn: () => jobVacancyApplicationService.getHirePreview(applicationId!),
        enabled: open && Boolean(applicationId),
    });

    const workSchedulesQuery = useQuery({
        queryKey: ["work-schedules", "active"],
        queryFn: () => workScheduleService.listActive(),
        enabled: open,
        staleTime: 60_000,
    });

    const jobPositionId = previewQuery.data?.jobPositionId ?? null;
    const salaryTableQuery = useQuery({
        queryKey: ["job-position-salary-tables", "current", jobPositionId ?? ""],
        queryFn: () => jobPositionSalaryTableService.findCurrentByJobPositionId(jobPositionId!),
        enabled: open && Boolean(jobPositionId),
        staleTime: 60_000,
    });

    const workScheduleItems = useMemo(
        (): SelectItem[] =>
            (workSchedulesQuery.data ?? []).map((item) => ({
                value: item.id,
                label: item.weeklyTotalHours ? `${item.name} (${item.weeklyTotalHours})` : item.name,
            })),
        [workSchedulesQuery.data],
    );

    const salaryBand = useMemo(() => {
        const items = salaryTableQuery.data?.items ?? [];
        if (items.length === 0) return null;
        const mins = items.map((item) => item.minSalary).filter((n) => Number.isFinite(n));
        const maxs = items.map((item) => item.maxSalary).filter((n) => Number.isFinite(n));
        if (mins.length === 0 || maxs.length === 0) return null;
        return { min: Math.min(...mins), max: Math.max(...maxs) };
    }, [salaryTableQuery.data]);

    const salaryNumber = parseSalary(baseSalary);
    const salaryBandStatus = useMemo(() => {
        if (salaryNumber == null || !salaryBand) return null;
        if (salaryNumber >= salaryBand.min && salaryNumber <= salaryBand.max) return "in" as const;
        return "out" as const;
    }, [salaryBand, salaryNumber]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setSubmitted(false);
        setExpectedStartDate(todayIso());
        setCandidateAcceptance("PENDING");
        setWorkScheduleId("");
        setCpf("");
        setContractType("CLT");
        setBaseSalary("");
    }, [open, applicationId]);

    useEffect(() => {
        const preview = previewQuery.data;
        if (!preview || !open) return;
        setContractType(preview.suggestedContractType ?? "CLT");
        if (preview.suggestedSalary != null && Number.isFinite(Number(preview.suggestedSalary))) {
            setBaseSalary(Number(preview.suggestedSalary).toFixed(2));
        }
        setCpf(preview.candidateCpf?.replace(/\D/g, "") ?? "");
    }, [previewQuery.data, open]);

    const hireMutation = useMutation({
        mutationFn: () => {
            if (!applicationId) throw new Error("Candidatura inválida.");
            return jobVacancyApplicationService.hire(applicationId, {
                contractType,
                expectedStartDate,
                baseSalary: salaryNumber,
                workScheduleId: workScheduleId || null,
                candidateAcceptance,
                cpf: cpf.replace(/\D/g, "") || null,
                columnKey,
            });
        },
        onSuccess: (result) => {
            const closed = result.closedApplicationIds?.length ?? 0;
            toast.success(
                closed > 0
                    ? `Contratação confirmada. ${closed} outra(s) candidatura(s) encerrada(s).`
                    : "Contratação confirmada",
                {
                    action: result.admissionProcessId
                        ? {
                              label: "Abrir admissão",
                              onClick: () => {
                                  window.location.href = `/collaborator/admission?edit=${encodeURIComponent(
                                      result.admissionProcessId,
                                  )}`;
                              },
                          }
                        : undefined,
                },
            );
            if (result.rehireWarning) {
                toast.warning(result.rehireWarning);
            }
            onSuccess?.(result);
            onClose();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível confirmar a contratação.",
            }),
    });

    const preview = previewQuery.data;
    const previewCpfDigits = preview?.candidateCpf?.replace(/\D/g, "") ?? "";
    const needsCpf = previewCpfDigits.length !== 11;
    const alreadyHired = Boolean(preview?.alreadyHired);
    const startDateError = submitted && !expectedStartDate ? "Informe a data de início." : undefined;
    const acceptanceError =
        submitted && candidateAcceptance !== "ACCEPTED"
            ? "O aceite do candidato precisa estar como Aceito para confirmar."
            : undefined;
    const cpfDigits = cpf.replace(/\D/g, "");
    const effectiveCpf = needsCpf ? cpfDigits : previewCpfDigits;
    const cpfError =
        submitted && effectiveCpf.length !== 11
            ? "Informe um CPF válido (11 dígitos)."
            : undefined;

    const handleConfirm = () => {
        setSubmitted(true);
        if (alreadyHired) return;
        if (!expectedStartDate || candidateAcceptance !== "ACCEPTED") return;
        if (effectiveCpf.length !== 11) return;
        hireMutation.mutate();
    };

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={(event) => {
                event.stopPropagation();
                if (event.target !== dialogRef.current) return;
                onClose();
            }}
            onCancel={(event) => {
                event.stopPropagation();
                if (event.target !== dialogRef.current) {
                    event.preventDefault();
                    return;
                }
                const openDialogs = document.querySelectorAll("dialog[open]");
                const topmost = openDialogs[openDialogs.length - 1];
                if (topmost && topmost !== dialogRef.current) {
                    event.preventDefault();
                }
            }}
        >
            <div className="modal-box flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-base-content">Proposta de contratação</h3>
                        <p className="mt-0.5 truncate text-sm text-base-content/55">
                            {preview?.candidateFullName ?? "Candidato"}
                            {preview?.jobVacancyTitle ? ` · ${preview.jobVacancyTitle}` : ""}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                        onClick={onClose}
                        disabled={hireMutation.isPending}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {previewQuery.isLoading ? (
                        <div className="grid gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="skeleton-shimmer h-12 w-full" />
                            ))}
                        </div>
                    ) : previewQuery.isError ? (
                        <p className="text-sm text-error">
                            {ExceptionCapture.displayMessage(
                                previewQuery.error,
                                "Não foi possível carregar a proposta.",
                            )}
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {preview?.rehireWarning ? (
                                <div className="flex gap-2 rounded-lg border border-warning/35 bg-warning/10 px-3 py-2.5 text-sm text-warning-content">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={2} />
                                    <p>{preview.rehireWarning}</p>
                                </div>
                            ) : null}

                            {alreadyHired ? (
                                <div className="rounded-lg border border-success/25 bg-success/5 px-3 py-2.5 text-sm text-base-content/70">
                                    Esta candidatura já foi convertida em admissão
                                    {preview?.admissionProcessId ? (
                                        <>
                                            .{" "}
                                            <a
                                                className="link link-primary"
                                                href={`/collaborator/admission?edit=${encodeURIComponent(
                                                    preview.admissionProcessId,
                                                )}`}
                                            >
                                                Abrir admissão
                                            </a>
                                        </>
                                    ) : (
                                        "."
                                    )}
                                </div>
                            ) : null}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <InputSelect
                                    label="Tipo de vínculo"
                                    items={CONTRACT_TYPE_ITEMS}
                                    value={contractType}
                                    onValueChange={(v) =>
                                        setContractType((v || "CLT") as AdmissionContractType)
                                    }
                                    disabled={alreadyHired || hireMutation.isPending}
                                    required
                                />
                                <InputDate
                                    label="Data de início"
                                    value={expectedStartDate}
                                    onValueChange={setExpectedStartDate}
                                    error={startDateError}
                                    disabled={alreadyHired || hireMutation.isPending}
                                    required
                                />
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <InputCurrency
                                        label="Salário"
                                        value={baseSalary}
                                        onValueChange={setBaseSalary}
                                        emitAsDecimal
                                        disabled={alreadyHired || hireMutation.isPending}
                                    />
                                    {salaryBandStatus ? (
                                        <span
                                            className={clsx(
                                                "inline-flex w-fit rounded px-2 py-0.5 text-[0.6875rem] font-semibold",
                                                salaryBandStatus === "in"
                                                    ? "bg-success/15 text-success"
                                                    : "bg-warning/15 text-warning",
                                            )}
                                        >
                                            {salaryBandStatus === "in"
                                                ? "Salário na faixa do cargo"
                                                : "Salário fora da faixa do cargo"}
                                        </span>
                                    ) : salaryTableQuery.isFetching ? (
                                        <span className="text-[0.6875rem] text-base-content/40">
                                            Consultando faixa salarial…
                                        </span>
                                    ) : null}
                                </div>
                                <InputSelect
                                    label="Escala"
                                    items={workScheduleItems}
                                    value={workScheduleId}
                                    onValueChange={setWorkScheduleId}
                                    placeholder={
                                        workSchedulesQuery.isLoading
                                            ? "Carregando escalas…"
                                            : "Selecione a escala"
                                    }
                                    disabled={alreadyHired || hireMutation.isPending}
                                    wrapperClassName="sm:col-span-2"
                                />
                                <InputSelect
                                    label="Aceite do candidato"
                                    items={ACCEPTANCE_ITEMS}
                                    value={candidateAcceptance}
                                    onValueChange={(v) =>
                                        setCandidateAcceptance((v || "PENDING") as CandidateAcceptance)
                                    }
                                    error={acceptanceError}
                                    disabled={alreadyHired || hireMutation.isPending}
                                    required
                                    wrapperClassName="sm:col-span-2"
                                />
                                {needsCpf ? (
                                    <InputString
                                        label="CPF"
                                        value={cpf}
                                        onValueChange={setCpf}
                                        error={cpfError}
                                        disabled={alreadyHired || hireMutation.isPending}
                                        required
                                        wrapperClassName="sm:col-span-2"
                                    />
                                ) : null}
                            </div>

                            <section className="rounded-lg border border-base-content/10 bg-base-content/[0.02] px-3 py-3">
                                <p className="text-xs font-semibold text-base-content">
                                    O que acontece ao confirmar
                                </p>
                                <ul className="mt-2 grid gap-1.5 text-xs text-base-content/65">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                                        Cria admissão ligada a esta candidatura
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                                        Encerra as demais candidaturas ativas da vaga
                                        {preview?.otherActiveApplicationsCount
                                            ? ` (${preview.otherActiveApplicationsCount})`
                                            : ""}
                                    </li>
                                    <li className="flex items-start gap-2 text-base-content/45">
                                        <Circle className="mt-0.5 size-3.5 shrink-0" />
                                        Link de pré-admissão e exame ocupacional — próxima entrega
                                    </li>
                                </ul>
                            </section>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-base-content/10 px-5 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={hireMutation.isPending}
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        loading={hireMutation.isPending}
                        disabled={
                            hireMutation.isPending ||
                            alreadyHired ||
                            previewQuery.isLoading ||
                            previewQuery.isError
                        }
                        onClick={handleConfirm}
                    >
                        Confirmar contratação
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    close
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
