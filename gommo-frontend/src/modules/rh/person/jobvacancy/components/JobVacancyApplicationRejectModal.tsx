"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { applicationAiScore } from "@/modules/rh/person/jobvacancy/lib/application-match-score";
import {
    MINIMUM_COMPATIBILITY_SCORE,
} from "@/modules/rh/person/jobvacancy/lib/job-application-rejection";
import type {
    JobVacancyApplication,
    JobVacancyApplicationRejectDto,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { Button } from "@/shared/components/ui/Button";
import { InputCheckbox, InputSelect, type SelectItem } from "@/shared/components/ui/input/index";
import { fieldClass } from "@/shared/components/ui/input/InputFieldChrome";

type JobVacancyApplicationRejectModalProps = {
    open: boolean;
    application: JobVacancyApplication | null;
    requirementOptions?: string[];
    loading?: boolean;
    onCancel: () => void;
    onConfirm: (dto: JobVacancyApplicationRejectDto) => void;
};

export function JobVacancyApplicationRejectModal({
    open,
    application,
    requirementOptions = [],
    loading = false,
    onCancel,
    onConfirm,
}: JobVacancyApplicationRejectModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [reason, setReason] = useState("");
    const [requirement, setRequirement] = useState("");
    const [note, setNote] = useState("");
    const [sendFeedback, setSendFeedback] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const reasonsQuery = useQuery({
        queryKey: jobVacancyApplicationKeys.rejectionReasons,
        queryFn: () => jobVacancyApplicationService.getRejectionReasons(),
        enabled: open,
        staleTime: Infinity,
    });

    const reasons = useMemo(() => reasonsQuery.data ?? [], [reasonsQuery.data]);
    const reasonItems = useMemo(
        (): SelectItem[] => reasons.map((item) => ({ value: item.key, label: item.label })),
        [reasons],
    );
    const selectedReason = reasons.find((item) => item.key === reason);
    const requiresRequirement = Boolean(selectedReason?.requiresRequirement);
    const isAssessmentReason = reason === "ASSESSMENT_BELOW_MINIMUM";
    const aiScore = applicationAiScore(application);
    const assessmentBlocked =
        isAssessmentReason &&
        (aiScore == null || aiScore >= (selectedReason?.minimumCompatibilityScore ?? MINIMUM_COMPATIBILITY_SCORE));
    const requirementItems = useMemo(
        (): SelectItem[] => requirementOptions.map((item) => ({ value: item, label: item })),
        [requirementOptions],
    );
    const hasEmail = Boolean(application?.candidateEmail?.trim());

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
        setReason("");
        setRequirement("");
        setNote("");
        setSendFeedback(true);
        setSubmitted(false);
    }, [open, application?.id]);

    const handleReasonChange = (value: string) => {
        setReason(value);
        setRequirement("");
        const next = reasons.find((item) => item.key === value);
        if (next) setSendFeedback(next.defaultSendFeedback);
    };

    const reasonError = submitted && !reason ? "Selecione o motivo do encerramento." : undefined;
    const requirementError =
        submitted && requiresRequirement && !requirement.trim()
            ? requirementOptions.length === 0
                ? "Cadastre requisitos na vaga antes de usar este motivo."
                : "Selecione qual requisito da vaga não foi atendido."
            : undefined;
    const assessmentError =
        submitted && assessmentBlocked
            ? aiScore == null
                ? "Aguarde a análise da IA ou escolha outro motivo."
                : `A compatibilidade atual é ${aiScore}% (mínimo para este motivo: ${MINIMUM_COMPATIBILITY_SCORE}%).`
            : undefined;

    const handleConfirm = () => {
        setSubmitted(true);
        if (!reason || (requiresRequirement && !requirement.trim()) || assessmentBlocked) return;
        onConfirm({
            reason,
            requirement: requiresRequirement ? requirement.trim() : undefined,
            note: note.trim() || undefined,
            sendFeedback: sendFeedback && hasEmail,
        });
    };

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={(event) => {
                event.stopPropagation();
                if (event.target !== dialogRef.current) return;
                onCancel();
            }}
        >
            <div className="modal-box flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-base-content">Encerrar candidato</h3>
                        <p className="mt-0.5 truncate text-sm text-base-content/55">
                            {application?.candidateFullName ?? "Candidato"}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                        onClick={onCancel}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-4">
                    <InputSelect
                        label="Motivo"
                        items={reasonItems}
                        value={reason}
                        onValueChange={handleReasonChange}
                        placeholder={reasonsQuery.isLoading ? "Carregando motivos..." : "Selecione o motivo"}
                        disabled={loading || reasonsQuery.isLoading}
                        error={reasonError}
                        required
                    />
                    {requiresRequirement ? (
                        <InputSelect
                            label="Qual requisito?"
                            items={requirementItems}
                            value={requirement}
                            onValueChange={setRequirement}
                            placeholder={
                                requirementOptions.length === 0
                                    ? "Nenhum requisito cadastrado na vaga"
                                    : "Selecione o requisito"
                            }
                            disabled={loading || requirementOptions.length === 0}
                            error={requirementError}
                            hint="Lista montada a partir dos requisitos da vaga e competências do cargo."
                            required
                        />
                    ) : null}
                    {isAssessmentReason ? (
                        <p
                            className={clsx(
                                "rounded-lg border px-3 py-2 text-[0.6875rem]",
                                assessmentBlocked
                                    ? "border-warning/30 bg-warning/10 text-warning"
                                    : "border-base-content/8 bg-base-content/[0.02] text-base-content/60",
                            )}
                        >
                            {aiScore == null
                                ? `Compatibilidade mínima fixa em ${MINIMUM_COMPATIBILITY_SCORE}% (configurável no futuro).`
                                : `Compatibilidade da IA: ${aiScore}%. Mínimo para este motivo: ${MINIMUM_COMPATIBILITY_SCORE}%.`}
                            {assessmentError ? ` ${assessmentError}` : null}
                        </p>
                    ) : null}
                    <div className="grid gap-1">
                        <label htmlFor="reject-note" className="text-xs font-medium text-base-content/70">
                            Observação interna
                        </label>
                        <textarea
                            id="reject-note"
                            rows={3}
                            maxLength={2000}
                            value={note}
                            disabled={loading}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Visível apenas para a equipe. Não é enviada ao candidato."
                            className={clsx(
                                "gommo-control inline-block! h-auto! min-h-20! items-start! overflow-auto! leading-normal! px-2.5! py-2! w-full resize-y text-xs",
                                fieldClass(),
                            )}
                        />
                    </div>
                    <div className="grid gap-1">
                        <InputCheckbox
                            checked={sendFeedback && hasEmail}
                            disabled={loading || !hasEmail}
                            onCheckedChange={setSendFeedback}
                            label="Enviar retorno ao candidato"
                            size="sm"
                        />
                        <p className="pl-6 text-[0.6875rem] text-base-content/45">
                            {hasEmail
                                ? "E-mail neutro de encerramento. O motivo interno não é enviado."
                                : "Candidato sem e-mail cadastrado: o retorno não pode ser enviado."}
                        </p>
                    </div>
                    <p className="flex items-start gap-2 rounded-lg border border-base-content/8 bg-base-content/[0.02] px-3 py-2 text-[0.6875rem] text-base-content/55">
                        <ShieldCheck className="mt-px size-3.5 shrink-0" strokeWidth={2.25} />
                        A decisão será registrada em seu nome na trilha de auditoria.
                    </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-base-content/10 px-5 py-3">
                    <Button type="button" variant="ghost" disabled={loading} onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        loading={loading}
                        disabled={assessmentBlocked}
                        onClick={handleConfirm}
                    >
                        Confirmar encerramento
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
