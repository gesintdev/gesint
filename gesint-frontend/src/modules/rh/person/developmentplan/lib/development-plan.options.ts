import type { DevelopmentPlanStatus } from "@/modules/rh/person/developmentplan/dto/development-plan.dto";

export const DEVELOPMENT_PLAN_STATUS_LABELS: Record<DevelopmentPlanStatus, string> = {
    DRAFT: "Rascunho",
    PENDING_APPROVAL: "Aguardando aprovação",
    IN_PROGRESS: "Em andamento",
    IN_REVIEW: "Em revisão",
    COMPLETED: "Concluído",
    CANCELED: "Cancelado",
    OVERDUE: "Atrasado",
};
