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
