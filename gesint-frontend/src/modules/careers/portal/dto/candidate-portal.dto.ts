export type CandidatePortalProviders = {
    password: boolean;
    google: boolean;
    googleClientId: string;
};

export type CandidatePortalTokenResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSeconds: number;
    fullName: string;
    email: string;
    tenantSlug?: string;
    tenantName?: string;
};

export type CandidatePortalMe = {
    accountId: string;
    candidateId: string;
    fullName: string;
    email: string;
    phone?: string | null;
    emailVerified: boolean;
    hasPassword: boolean;
    googleLinked: boolean;
    privacyConsentActive: boolean;
    talentPoolConsentActive: boolean;
    organizationName: string;
};

export type CandidatePortalTimelineStep = {
    key: string;
    label: string;
    state: "done" | "current" | "pending" | string;
};

export type CandidatePortalApplication = {
    applicationId: string;
    vacancyId: string;
    vacancySlug?: string | null;
    jobTitle: string;
    location?: string | null;
    appliedAt: string;
    stageKey: string;
    stageLabel: string;
    resultLabel?: string | null;
    withdrawable: boolean;
    timeline: CandidatePortalTimelineStep[];
    offerPending?: boolean;
    offerAccepted?: boolean;
    offerDeclined?: boolean;
    offerContractType?: string | null;
    offerBaseSalary?: number | null;
    offerExpectedStartDate?: string | null;
    offerSentAt?: string | null;
    preAdmissionAvailable?: boolean;
    admissionProcessId?: string | null;
};

export type CandidatePortalOffer = {
    applicationId: string;
    jobTitle: string;
    location?: string | null;
    contractType?: string | null;
    baseSalary?: number | null;
    expectedStartDate?: string | null;
    experiencePeriod?: string | null;
    offerSentAt?: string | null;
    candidateAcceptance?: string | null;
    actionable?: boolean;
};

export type CandidatePortalPreAdmissionItem = {
    key: string;
    label: string;
    done: boolean;
    required: boolean;
};

export type CandidatePortalPreAdmissionDocument = {
    linkId: string;
    objectId: string;
    documentType?: string | null;
    displayName?: string | null;
};

export type CandidatePortalPreAdmission = {
    admissionProcessId: string;
    applicationId?: string | null;
    jobTitle?: string | null;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    cpf?: string | null;
    bankCode?: string | null;
    bankAgency?: string | null;
    bankAccount?: string | null;
    bankAccountDigit?: string | null;
    bankAccountType?: string | null;
    pixKey?: string | null;
    affirmativePcd?: boolean;
    pcdSelfDeclared?: boolean | null;
    completed?: boolean;
    completedAt?: string | null;
    linkSentAt?: string | null;
    pendingItems?: CandidatePortalPreAdmissionItem[];
    documents?: CandidatePortalPreAdmissionDocument[];
};

export type CandidatePortalRegisterPayload = {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
};

export type CandidatePortalLoginPayload = {
    email: string;
    password: string;
};
