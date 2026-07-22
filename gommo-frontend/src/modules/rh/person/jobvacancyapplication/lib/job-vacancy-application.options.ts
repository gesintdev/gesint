import type { JobVacancyApplicationStatus } from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const JOB_VACANCY_APPLICATION_STATUS_LABELS: Record<JobVacancyApplicationStatus, string> = {
    APPLIED: "Candidatou-se",
    SCREENING: "Triagem",
    INTERVIEW: "Entrevista",
    OFFER: "Proposta",
    HIRED: "Contratado",
    REJECTED: "Reprovado",
};

export const JOB_VACANCY_APPLICATION_STATUS_ITEMS: SelectItem[] = (
    Object.entries(JOB_VACANCY_APPLICATION_STATUS_LABELS) as [JobVacancyApplicationStatus, string][]
).map(([value, label]) => ({ value, label }));
