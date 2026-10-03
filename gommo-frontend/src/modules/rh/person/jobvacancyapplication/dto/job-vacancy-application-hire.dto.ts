export type CandidateAcceptance = "PENDING" | "ACCEPTED" | "DECLINED";

export type AdmissionContractType =
    | "CLT"
    | "PJ"
    | "INTERMITTENT"
    | "APPRENTICE"
    | "INTERN";

export type JobVacancyApplicationHirePreview = {
    applicationId: string;
    candidateId: string;
    candidateFullName?: string | null;
    candidateCpf?: string | null;
    candidateEmail?: string | null;
    candidatePhone?: string | null;
    candidateBirthDate?: string | null;
    jobVacancyId: string;
    jobVacancyTitle?: string | null;
    jobPositionId?: string | null;
    vacancyContractType?: string | null;
    suggestedContractType?: AdmissionContractType | null;
    suggestedSalary?: number | null;
    suggestedSalaryMax?: number | null;
    vacancyWorkSchedule?: string | null;
    alreadyHired: boolean;
    admissionProcessId?: string | null;
    rehireWarning?: string | null;
    otherActiveApplicationsCount?: number | null;
};

export type JobVacancyApplicationHireRequest = {
    contractType: AdmissionContractType;
    expectedStartDate: string;
    baseSalary?: number | null;
    workScheduleId?: string | null;
    candidateAcceptance: CandidateAcceptance;
    cpf?: string | null;
    birthDate?: string | null;
    email?: string | null;
    phone?: string | null;
    columnKey: string;
};

export type JobVacancyApplicationHireResponse = {
    applicationId: string;
    admissionProcessId: string;
    admissionCode?: number | null;
    candidateFullName?: string | null;
    closedApplicationIds?: string[];
    rehireWarning?: string | null;
};
