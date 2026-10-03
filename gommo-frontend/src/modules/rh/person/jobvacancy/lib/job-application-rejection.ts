import type { RejectionFeedbackStatus } from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";

/** Coluna de sistema: candidaturas encerradas (reprovação, desistência, vaga cancelada). */
export const CLOSED_KANBAN_COLUMN_KEY = "closed";

/** @deprecated use {@link CLOSED_KANBAN_COLUMN_KEY} */
export const REJECTED_KANBAN_COLUMN_KEY = CLOSED_KANBAN_COLUMN_KEY;

export const MINIMUM_COMPATIBILITY_SCORE = 80;

export const REJECTION_FEEDBACK_LABELS: Record<RejectionFeedbackStatus, string> = {
    NOT_SENT: "Retorno não enviado",
    PENDING: "Retorno em envio",
    SENT: "Retorno enviado",
    FAILED: "Falha no retorno",
};

export const REJECTION_FEEDBACK_TONE: Record<RejectionFeedbackStatus, string> = {
    NOT_SENT: "text-base-content/45",
    PENDING: "text-warning",
    SENT: "text-success",
    FAILED: "text-error",
};
