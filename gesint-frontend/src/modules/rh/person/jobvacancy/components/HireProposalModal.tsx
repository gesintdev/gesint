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
import { JOB_REQUISITION_EXPERIENCE_PERIOD_ITEMS } from "@/modules/rh/person/jobrequisition/lib/job-requisition.options";
import type {
    AcceptanceChannel,
    AdmissionContractType,
    HireExperiencePeriod,
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

const ACCEPTANCE_CHANNEL_ITEMS: SelectItem[] = [
    { value: "VERBAL", label: "Verbal" },
    { value: "EMAIL", label: "E-mail" },
    { value: "WHATSAPP", label: "WhatsApp" },
    { value: "PORTAL", label: "Portal do candidato" },
];

function ChecklistItem({
    done,
    children,
}: {
    done: boolean;
    children: React.ReactNode;
}) {
    return (
        <li
            className={clsx(
                "flex items-start gap-2",
                done ? "text-base-content/65" : "text-base-content/45",
            )}
        >
            {done ? (
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
            ) : (
                <Circle className="mt-0.5 size-3.5 shrink-0" />
            )}
            {children}
        </li>
    );
}

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
    const [experiencePeriod, setExperiencePeriod] = useState<HireExperiencePeriod>("DAYS_45_45");
    const [expectedStartDate, setExpectedStartDate] = useState("");
    const [baseSalary, setBaseSalary] = useState("");
    const [workScheduleId, setWorkScheduleId] = useState("");
    const [acceptanceDate, setAcceptanceDate] = useState("");
    const [acceptanceChannel, setAcceptanceChannel] = useState<AcceptanceChannel | "">("");
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

    const isClt = contractType === "CLT";

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
        setAcceptanceDate(todayIso());
        setAcceptanceChannel("");
        setWorkScheduleId("");
        setCpf("");
        setContractType("CLT");
        setExperiencePeriod("DAYS_45_45");
        setBaseSalary("");
    }, [open, applicationId]);

    useEffect(() => {
        const preview = previewQuery.data;
        if (!preview || !open) return;
        setContractType(preview.suggestedContractType ?? "CLT");
        setExperiencePeriod(
            (preview.suggestedExperiencePeriod as HireExperiencePeriod) ?? "DAYS_45_45",
        );
        if (preview.suggestedSalary != null && Number.isFinite(Number(preview.suggestedSalary))) {
            setBaseSalary(Number(preview.suggestedSalary).toFixed(2));
        }
        setCpf(preview.candidateCpf?.replace(/\D/g, "") ?? "");
        if (preview.offerExpectedStartDate) {
            setExpectedStartDate(preview.offerExpectedStartDate);
        }
        if (preview.offerWorkScheduleId) {
            setWorkScheduleId(preview.offerWorkScheduleId);
        }
        if (preview.portalAccepted) {
            setAcceptanceChannel("PORTAL");
            if (preview.acceptanceDate) {
                setAcceptanceDate(preview.acceptanceDate);
            }
        }
    }, [previewQuery.data, open]);

    const hireMutation = useMutation({
        mutationFn: () => {
            if (!applicationId) throw new Error("Candidatura inválida.");
            if (!acceptanceChannel) throw new Error("Informe a forma do aceite.");
            return jobVacancyApplicationService.hire(applicationId, {
                contractType,
                experiencePeriod: isClt ? experiencePeriod : "NONE",
                expectedStartDate,
                baseSalary: salaryNumber,
                workScheduleId: workScheduleId || null,
                candidateAcceptance: "ACCEPTED",
                acceptanceDate,
                acceptanceChannel,
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
            if (result.preAdmissionLinkSent && result.preAdmissionPortalPath) {
                toast.message("Link de pré-admissão gerado", {
                    description: result.preAdmissionPortalPath,
                });
            }
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

    const offerMutation = useMutation({
        mutationFn: () => {
            if (!applicationId) throw new Error("Candidatura inválida.");
            return jobVacancyApplicationService.sendOffer(applicationId, {
                contractType,
                experiencePeriod: isClt ? experiencePeriod : "NONE",
                expectedStartDate,
                baseSalary: salaryNumber,
                workScheduleId: workScheduleId || null,
            });
        },
        onSuccess: () => {
            toast.success("Proposta enviada ao portal do candidato");
            void previewQuery.refetch();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível enviar a proposta ao portal.",
            }),
    });

    const preview = previewQuery.data;
    const previewCpfDigits = preview?.candidateCpf?.replace(/\D/g, "") ?? "";
    const needsCpf = previewCpfDigits.length !== 11;
    const alreadyHired = Boolean(preview?.alreadyHired);
    const portalAccepted = Boolean(preview?.portalAccepted);
    const offerPending = Boolean(preview?.offerPending);
    const portalDeclined = Boolean(preview?.portalDeclined);
    const waitingPortalAccept = acceptanceChannel === "PORTAL" && !portalAccepted;
    const startDateError = submitted && !expectedStartDate ? "Informe a data de início." : undefined;
    const acceptanceDateError =
        submitted && !waitingPortalAccept && !acceptanceDate
            ? "Informe a data do aceite."
            : undefined;
    const acceptanceChannelError =
        submitted && !acceptanceChannel ? "Informe a forma do aceite." : undefined;
    const cpfDigits = cpf.replace(/\D/g, "");
    const effectiveCpf = needsCpf ? cpfDigits : previewCpfDigits;
    const cpfError =
        submitted && effectiveCpf.length !== 11
            ? "Informe um CPF válido (11 dígitos)."
            : undefined;

    const checklistPreAdmissionDone = acceptanceChannel === "PORTAL";
    const checklistAsoDone = true;
    const checklistOthersDone = true;

    const handleConfirm = () => {
        setSubmitted(true);
        if (alreadyHired) return;
        if (waitingPortalAccept) return;
        if (!expectedStartDate || !acceptanceDate || !acceptanceChannel) return;
        if (effectiveCpf.length !== 11) return;
        hireMutation.mutate();
    };

    const handleSendOffer = () => {
        setSubmitted(true);
        if (alreadyHired || portalAccepted) return;
        if (!expectedStartDate) return;
        offerMutation.mutate();
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
                        <h3 className="text-base font-semibold text-base-content">
                            Contratar {preview?.candidateFullName ?? "candidato"}
                            {preview?.jobVacancyTitle ? ` · ${preview.jobVacancyTitle}` : ""}
                        </h3>
                        <p className="mt-0.5 text-xs text-base-content/50">
                            Proposta de contratação · RN-37 / RN-38
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gesint-btn gesint-btn--ghost gesint-btn--icon-only shrink-0 text-base-content/50"
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

                            {portalAccepted ? (
                                <div className="rounded-lg border border-success/25 bg-success/5 px-3 py-2.5 text-sm text-base-content/70">
                                    Candidato já aceitou a proposta pelo portal
                                    {preview?.acceptanceDate
                                        ? ` em ${preview.acceptanceDate}`
                                        : ""}
                                    . Confirme os termos e finalize a contratação.
                                </div>
                            ) : null}

                            {offerPending ? (
                                <div className="rounded-lg border border-info/25 bg-info/5 px-3 py-2.5 text-sm text-base-content/70">
                                    Proposta enviada ao portal — aguardando aceite do candidato.
                                </div>
                            ) : null}

                            {portalDeclined ? (
                                <div className="rounded-lg border border-warning/35 bg-warning/10 px-3 py-2.5 text-sm text-base-content/70">
                                    Candidato recusou a proposta no portal. Você pode enviar uma nova
                                    proposta ou registrar outro canal de aceite.
                                </div>
                            ) : null}

                            <section className="grid gap-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/55">
                                    Proposta
                                </h4>
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
                                    {isClt ? (
                                        <InputSelect
                                            label="Período de experiência"
                                            items={JOB_REQUISITION_EXPERIENCE_PERIOD_ITEMS}
                                            value={experiencePeriod}
                                            onValueChange={(v) =>
                                                setExperiencePeriod(
                                                    (v || "DAYS_45_45") as HireExperiencePeriod,
                                                )
                                            }
                                            disabled={alreadyHired || hireMutation.isPending}
                                            required
                                        />
                                    ) : (
                                        <InputDate
                                            label="Data de início"
                                            value={expectedStartDate}
                                            onValueChange={setExpectedStartDate}
                                            error={startDateError}
                                            disabled={alreadyHired || hireMutation.isPending}
                                            required
                                        />
                                    )}
                                    {isClt ? (
                                        <InputDate
                                            label="Data de início"
                                            value={expectedStartDate}
                                            onValueChange={setExpectedStartDate}
                                            error={startDateError}
                                            disabled={alreadyHired || hireMutation.isPending}
                                            required
                                        />
                                    ) : null}
                                    <div className="grid gap-1.5">
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
                                                {salaryBandStatus === "in" ? "na faixa" : "fora da faixa"}
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
                                    />
                                    <InputDate
                                        label="Data do aceite"
                                        value={acceptanceDate}
                                        onValueChange={setAcceptanceDate}
                                        error={acceptanceDateError}
                                        disabled={
                                            alreadyHired ||
                                            hireMutation.isPending ||
                                            portalAccepted ||
                                            waitingPortalAccept
                                        }
                                        required={!waitingPortalAccept}
                                    />
                                    <InputSelect
                                        label="Forma do aceite"
                                        items={ACCEPTANCE_CHANNEL_ITEMS}
                                        value={acceptanceChannel}
                                        onValueChange={(v) =>
                                            setAcceptanceChannel((v || "") as AcceptanceChannel | "")
                                        }
                                        error={acceptanceChannelError}
                                        disabled={
                                            alreadyHired || hireMutation.isPending || portalAccepted
                                        }
                                        required
                                        placeholder="Verbal, e-mail, WhatsApp ou portal"
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
                                <p className="text-[0.6875rem] text-base-content/45">
                                    {portalAccepted
                                        ? "Aceite já registrado pelo portal. Finalize a contratação abaixo."
                                        : waitingPortalAccept
                                          ? "Com canal Portal: envie a proposta e aguarde o aceite do candidato antes de confirmar."
                                          : "Registre o aceite (verbal, e-mail ou WhatsApp) ou use o portal do candidato."}
                                </p>
                            </section>

                            <section className="rounded-lg border border-base-content/10 bg-base-content/[0.02] px-3 py-3">
                                <p className="text-xs font-semibold text-base-content">
                                    O que acontece ao confirmar
                                </p>
                                <ul className="mt-2 grid gap-1.5 text-xs">
                                    <ChecklistItem done>
                                        Cria a admissão ligada a esta candidatura (mesma pessoa, sem
                                        redigitar)
                                    </ChecklistItem>
                                    <ChecklistItem done={checklistPreAdmissionDone}>
                                        {checklistPreAdmissionDone
                                            ? `Gera link de pré-admissão no portal (documentos, dados bancários${
                                                  preview?.affirmativePcd
                                                      ? ", autodeclaração PCD opcional"
                                                      : ""
                                              })`
                                            : "Link de pré-admissão no portal — apenas com canal Portal"}
                                    </ChecklistItem>
                                    <ChecklistItem done={checklistAsoDone}>
                                        Prevê o exame admissional (ASO) conforme a Matriz de Exames do
                                        cargo
                                    </ChecklistItem>
                                    <ChecklistItem done={checklistOthersDone}>
                                        Encerra as demais candidaturas ativas desta vaga e envia
                                        retorno
                                        {preview?.otherActiveApplicationsCount
                                            ? ` (${preview.otherActiveApplicationsCount})`
                                            : ""}
                                    </ChecklistItem>
                                    <ChecklistItem done={false}>
                                        Envio S-2200 / eSocial fica fora desta etapa (fora de escopo)
                                    </ChecklistItem>
                                </ul>
                                {preview?.rehireWarning ? (
                                    <div className="mt-3 flex gap-2 rounded-lg border border-warning/35 bg-warning/10 px-3 py-2.5 text-sm text-warning-content">
                                        <AlertTriangle
                                            className="mt-0.5 size-4 shrink-0 text-warning"
                                            strokeWidth={2}
                                        />
                                        <p>{preview.rehireWarning}</p>
                                    </div>
                                ) : null}
                            </section>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-base-content/10 px-5 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={hireMutation.isPending || offerMutation.isPending}
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    {waitingPortalAccept || offerPending || portalDeclined ? (
                        <Button
                            type="button"
                            variant="outline"
                            loading={offerMutation.isPending}
                            disabled={
                                offerMutation.isPending ||
                                hireMutation.isPending ||
                                alreadyHired ||
                                portalAccepted ||
                                offerPending ||
                                previewQuery.isLoading ||
                                previewQuery.isError
                            }
                            onClick={handleSendOffer}
                        >
                            {offerPending ? "Proposta já enviada" : "Enviar proposta ao portal"}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        loading={hireMutation.isPending}
                        disabled={
                            hireMutation.isPending ||
                            offerMutation.isPending ||
                            alreadyHired ||
                            waitingPortalAccept ||
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
