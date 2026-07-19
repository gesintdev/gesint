import type { JobBoardKey, JobVacancySeniority } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
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
