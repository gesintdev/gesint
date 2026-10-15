export type CandidateAcceptance = "PENDING" | "ACCEPTED" | "DECLINED";

export type AcceptanceChannel = "VERBAL" | "EMAIL" | "WHATSAPP" | "PORTAL";

export type AdmissionContractType =
    | "CLT"
    | "PJ"
    | "INTERMITTENT"
    | "APPRENTICE"
    | "INTERN";

export type HireExperiencePeriod = "NONE" | "DAYS_30_60" | "DAYS_45_45" | "DAYS_90";

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
    suggestedExperiencePeriod?: HireExperiencePeriod | null;
    suggestedSalary?: number | null;
    suggestedSalaryMax?: number | null;
    vacancyWorkSchedule?: string | null;
    alreadyHired: boolean;
    admissionProcessId?: string | null;
    rehireWarning?: string | null;
    otherActiveApplicationsCount?: number | null;
    candidateAcceptance?: CandidateAcceptance | null;
    acceptanceDate?: string | null;
    acceptanceChannel?: AcceptanceChannel | null;
    offerPending?: boolean;
    portalAccepted?: boolean;
    portalDeclined?: boolean;
    offerSentAt?: string | null;
    offerExpectedStartDate?: string | null;
    offerBaseSalary?: number | null;
    offerContractType?: AdmissionContractType | null;
    offerExperiencePeriod?: HireExperiencePeriod | string | null;
    offerWorkScheduleId?: string | null;
    affirmativePcd?: boolean;
};

export type JobVacancyApplicationOfferRequest = {
    contractType: AdmissionContractType;
    experiencePeriod?: HireExperiencePeriod | null;
    expectedStartDate: string;
    baseSalary?: number | null;
    workScheduleId?: string | null;
};

export type JobVacancyApplicationOfferResponse = {
    applicationId: string;
    candidateAcceptance?: CandidateAcceptance | null;
    offerSentAt?: string | null;
    contractType?: AdmissionContractType | null;
    baseSalary?: number | null;
    expectedStartDate?: string | null;
    experiencePeriod?: string | null;
    workScheduleId?: string | null;
    candidateFullName?: string | null;
    jobVacancyTitle?: string | null;
};

export type JobVacancyApplicationHireRequest = {
    contractType: AdmissionContractType;
    experiencePeriod?: HireExperiencePeriod | null;
    expectedStartDate: string;
    baseSalary?: number | null;
    workScheduleId?: string | null;
    candidateAcceptance: CandidateAcceptance;
    acceptanceDate: string;
    acceptanceChannel: AcceptanceChannel;
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
    closedApplicationsCount?: number | null;
    rehireWarning?: string | null;
    preAdmissionPortalPath?: string | null;
    preAdmissionLinkSent?: boolean;
    asoPredicted?: boolean;
};
