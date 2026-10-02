import type {
    JobRequisitionExperiencePeriod,
    JobRequisitionReason,
    JobRequisitionStatus,
} from "@/modules/rh/person/jobrequisition/dto/job-requisition.dto";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const JOB_REQUISITION_REASON_LABELS: Record<JobRequisitionReason, string> = {
    HEADCOUNT_INCREASE: "Aumento de quadro",
    REPLACEMENT: "Substituição",
};

export const JOB_REQUISITION_REASON_VALUES: JobRequisitionReason[] = ["HEADCOUNT_INCREASE", "REPLACEMENT"];

export const JOB_REQUISITION_EXPERIENCE_PERIOD_ITEMS: SelectItem[] = [
    { value: "NONE", label: "Sem experiência" },
    { value: "DAYS_30_60", label: "Experiência 30+60" },
    { value: "DAYS_45_45", label: "Experiência 45+45" },
    { value: "DAYS_90", label: "Experiência 90 dias" },
];

export const JOB_REQUISITION_EXPERIENCE_PERIOD_LABELS: Record<JobRequisitionExperiencePeriod, string> =
    Object.fromEntries(
        JOB_REQUISITION_EXPERIENCE_PERIOD_ITEMS.map((item) => [item.value, item.label]),
    ) as Record<JobRequisitionExperiencePeriod, string>;

export const JOB_REQUISITION_STATUS_LABELS: Record<JobRequisitionStatus, string> = {
    DRAFT: "Rascunho",
    PENDING_MANAGER: "Aguardando gestor",
    PENDING_HR: "Aguardando RH",
    PENDING_DIRECTOR: "Aguardando diretoria",
    APPROVED: "Aprovada",
    REJECTED: "Reprovada",
    CANCELED: "Cancelada",
};

export const JOB_REQUISITION_STAGE_PERMISSION: Partial<Record<JobRequisitionStatus, string>> = {
    PENDING_MANAGER: "jobrequisition:approvemanager",
    PENDING_HR: "jobrequisition:approvehr",
    PENDING_DIRECTOR: "jobrequisition:approvedirector",
};

export function isPendingRequisition(status?: JobRequisitionStatus | null): boolean {
    return status === "PENDING_MANAGER" || status === "PENDING_HR" || status === "PENDING_DIRECTOR";
}
