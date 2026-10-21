import type {
    JobBoardKey,
    JobVacancyContractType,
    JobVacancySeniority,
    JobVacancyWorkModality,
} from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const JOB_VACANCY_SENIORITY_VALUES = ["JUNIOR", "PLENO", "SENIOR"] as const;

export const JOB_VACANCY_SENIORITY_LABELS: Record<JobVacancySeniority, string> = {
    JUNIOR: "Júnior",
    PLENO: "Pleno",
    SENIOR: "Sênior",
};

export const JOB_VACANCY_SENIORITY_ITEMS: SelectItem[] = JOB_VACANCY_SENIORITY_VALUES.map((value) => ({
    value,
    label: JOB_VACANCY_SENIORITY_LABELS[value],
}));

export const JOB_VACANCY_WORK_MODALITY_VALUES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const;

export const JOB_VACANCY_WORK_MODALITY_LABELS: Record<JobVacancyWorkModality, string> = {
    PRESENCIAL: "Presencial",
    HIBRIDO: "Híbrido",
    REMOTO: "Remoto",
};

export const JOB_VACANCY_WORK_MODALITY_ITEMS: SelectItem[] = JOB_VACANCY_WORK_MODALITY_VALUES.map((value) => ({
    value,
    label: JOB_VACANCY_WORK_MODALITY_LABELS[value],
}));

export const JOB_VACANCY_CONTRACT_TYPE_VALUES = [
    "CLT",
    "PJ",
    "ESTAGIO",
    "TEMPORARIO",
    "FREELANCER",
] as const;

export const JOB_VACANCY_CONTRACT_TYPE_LABELS: Record<JobVacancyContractType, string> = {
    CLT: "CLT",
    PJ: "PJ",
    ESTAGIO: "Estágio",
    TEMPORARIO: "Temporário",
    FREELANCER: "Freelancer",
};

export const JOB_VACANCY_CONTRACT_TYPE_ITEMS: SelectItem[] = JOB_VACANCY_CONTRACT_TYPE_VALUES.map((value) => ({
    value,
    label: JOB_VACANCY_CONTRACT_TYPE_LABELS[value],
}));

export const JOB_VACANCY_WORK_SCHEDULE_ITEMS: SelectItem[] = [
    { value: "Tempo integral", label: "Tempo integral" },
    { value: "Meio período", label: "Meio período" },
    { value: "Por demanda", label: "Por demanda" },
];

export type JobBoardOption = {
    key: JobBoardKey;
    label: string;
    description: string;
    accessNote: string;
};

export const JOB_BOARD_OPTIONS: JobBoardOption[] = [
    {
        key: "CATHO",
        label: "Catho",
        description: "Portal com API pública para anúncio de vagas.",
        accessNote: "Integração gratuita prevista (credenciais por empresa).",
    },
    {
        key: "INDEED",
        label: "Indeed",
        description: "Alcance amplo; postagem orgânica via parceria ATS.",
        accessNote: "Requer parceria / configuração.",
    },
    {
        key: "LINKEDIN",
        label: "LinkedIn",
        description: "Rede profissional com slots e parcerias restritas.",
        accessNote: "Sem envio gratuito via API aberta.",
    },
    {
        key: "INFOJOBS",
        label: "InfoJobs",
        description: "Portal brasileiro de recrutamento.",
        accessNote: "Geralmente requer contrato comercial.",
    },
    {
        key: "VAGAS_COM",
        label: "Vagas.com",
        description: "Portal brasileiro de recrutamento.",
        accessNote: "Geralmente requer contrato comercial.",
    },
];
