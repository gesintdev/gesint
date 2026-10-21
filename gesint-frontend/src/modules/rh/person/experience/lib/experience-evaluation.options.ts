import type {
    ExperienceDecision,
    ExperiencePeriod,
    ExperiencePeriodStatus,
} from "@/modules/rh/person/experience/dto/experience-evaluation.dto";

export const EXPERIENCE_PERIOD_LABELS: Record<ExperiencePeriod, string> = {
    NONE: "Sem experiência",
    DAYS_30_60: "30+30 dias",
    DAYS_45_45: "45+45 dias",
    DAYS_90: "90 dias",
};

export const EXPERIENCE_PERIOD_STATUS_LABELS: Record<ExperiencePeriodStatus, string> = {
    IN_PERIOD: "Em período",
    PENDING_DECISION: "Decidir",
    EFFECTIVE: "Efetivado",
    EXTENDED: "Prorrogado",
    ENDED: "Encerrado",
};

export const EXPERIENCE_DECISION_LABELS: Record<ExperienceDecision, string> = {
    EFFECTIVE: "Efetivar",
    EXTEND: "Prorrogar",
    END: "Encerrar",
    AUTO_EFFECTIVE: "Efetivação automática",
};

export const EXPERIENCE_DECISION_REASONS = [
    "Desempenho abaixo do esperado",
    "Adequação cultural insuficiente",
    "Competência crítica abaixo do nível esperado",
    "Pedido do colaborador",
    "Reorganização / extinção da necessidade",
    "Outro",
] as const;
