export type CareersFontStyle = "MODERN" | "CLASSIC" | "ROUNDED";
export type CareersCornerStyle = "ROUNDED" | "SOFT" | "SQUARE";

export const CAREERS_SYSTEM_BLOCK_TYPES = [
    "HERO",
    "WHY_WORK_HERE",
    "BENEFITS",
    "DAY_IN_LIFE",
    "OPEN_VACANCIES",
    "TALENT_POOL",
] as const;

export const CAREERS_CUSTOM_BLOCK_TYPES = ["TEXT", "IMAGE_TEXT", "STATS", "FAQ", "VIDEO", "CTA"] as const;

export type CareersSystemBlockType = (typeof CAREERS_SYSTEM_BLOCK_TYPES)[number];
export type CareersCustomBlockType = (typeof CAREERS_CUSTOM_BLOCK_TYPES)[number];
export type CareersBlockType = CareersSystemBlockType | CareersCustomBlockType;

export type CareersSocialNetwork =
    | "website"
    | "linkedin"
    | "instagram"
    | "facebook"
    | "youtube"
    | "tiktok"
    | "x"
    | "glassdoor";

/** Conteúdo livre do bloco (jsonb). Cada tipo lê as chaves que conhece. */
export type CareersBlockContent = Record<string, unknown>;

export type CareersBlock = {
    id?: string | null;
    type: CareersBlockType;
    title?: string | null;
    subtitle?: string | null;
    content: CareersBlockContent;
    visible: boolean;
    systemBlock?: boolean | null;
};

export type CareersItem = { title?: string; description?: string };
export type CareersPhoto = { objectId: string; caption?: string };
export type CareersTestimonial = { name?: string; role?: string; quote?: string; photoObjectId?: string };
export type CareersStat = { value?: string; label?: string };
export type CareersFaqItem = { question?: string; answer?: string };

export type CareersBranding = {
    displayName?: string | null;
    logoObjectId?: string | null;
    primaryColor?: string | null;
    accentColor?: string | null;
    fontStyle?: CareersFontStyle | null;
    cornerStyle?: CareersCornerStyle | null;
    showSalary: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    socialLinks: Partial<Record<CareersSocialNetwork, string>>;
};

export type CareersPrivacy = {
    notice: string;
    version: string;
    talentPoolMonths: number;
};

export type CareersWorkModality = "PRESENCIAL" | "HIBRIDO" | "REMOTO";
export type CareersContractType = "CLT" | "PJ" | "ESTAGIO" | "TEMPORARIO" | "FREELANCER";
export type CareersSeniority = "JUNIOR" | "PLENO" | "SENIOR";

export type CareersVacancySummary = {
    slug: string;
    code?: number | null;
    jobTitle: string;
    department?: string | null;
    location?: string | null;
    workModality?: CareersWorkModality | null;
    contractType?: CareersContractType | null;
    seniorityLevel?: CareersSeniority | null;
    salary?: number | null;
    salaryMax?: number | null;
    publishedAt?: string | null;
    expectedCompletionDate?: string | null;
};

export type CareersSite = {
    organizationName: string;
    customized: boolean;
    branding: CareersBranding;
    blocks: CareersBlock[];
    vacancies: CareersVacancySummary[];
    privacy: CareersPrivacy;
};

export type CareersVacancy = CareersVacancySummary & {
    description?: string | null;
    activities?: string | null;
    assignments?: string | null;
    requirements?: string | null;
    benefits?: string | null;
    workSchedule?: string | null;
    /** Omit JSON-LD when false. Defaults to true when absent. */
    publishGoogleJobs?: boolean | null;
    organizationName: string;
    customized: boolean;
    branding: CareersBranding;
    privacy: CareersPrivacy;
};

export type CareersExperiencePayload = {
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string;
    currentJob?: boolean;
    description?: string;
};

export type CareersApplicationPayload = {
    fullName: string;
    email: string;
    phone: string;
    city?: string;
    stateCode?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    coverLetter?: string;
    referralSource?: string;
    salaryExpectation?: number;
    experiences?: CareersExperiencePayload[];
    privacyConsent: boolean;
    talentPoolConsent: boolean;
};

export type CareersApplicationResult = {
    message: string;
};
