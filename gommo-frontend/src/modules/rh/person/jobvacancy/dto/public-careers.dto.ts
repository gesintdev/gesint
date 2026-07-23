export type PublicJobVacancy = {
    slug: string;
    code?: number;
    jobTitle: string;
    description?: string | null;
    activities?: string | null;
    assignments?: string | null;
    requirements?: string | null;
    benefits?: string | null;
    department?: string | null;
    location?: string | null;
    workModality?: "PRESENCIAL" | "HIBRIDO" | "REMOTO" | null;
    contractType?: "CLT" | "PJ" | "ESTAGIO" | "TEMPORARIO" | "FREELANCER" | null;
    workSchedule?: string | null;
    seniorityLevel?: "JUNIOR" | "PLENO" | "SENIOR" | null;
    salary?: number | null;
    salaryMax?: number | null;
    publishedAt?: string | null;
};

export type PublicJobExperiencePayload = {
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string;
    currentJob?: boolean;
    description?: string;
};

export type PublicJobApplicationPayload = {
    fullName: string;
    cpf: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    city?: string;
    stateCode?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    coverLetter?: string;
    referralSource?: string;
    experiences?: PublicJobExperiencePayload[];
};

export type PublicJobApplicationResult = {
    message: string;
};
