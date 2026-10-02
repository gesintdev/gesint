import type {
    CareersContractType,
    CareersSeniority,
    CareersSocialNetwork,
    CareersWorkModality,
} from "@/modules/careers/shared/dto/careers.dto";

export const CAREERS_WORK_MODALITY_LABELS: Record<CareersWorkModality, string> = {
    PRESENCIAL: "Presencial",
    HIBRIDO: "Híbrido",
    REMOTO: "Remoto",
};

export const CAREERS_CONTRACT_TYPE_LABELS: Record<CareersContractType, string> = {
    CLT: "CLT",
    PJ: "PJ",
    ESTAGIO: "Estágio",
    TEMPORARIO: "Temporário",
    FREELANCER: "Freelancer",
};

export const CAREERS_SENIORITY_LABELS: Record<CareersSeniority, string> = {
    JUNIOR: "Júnior",
    PLENO: "Pleno",
    SENIOR: "Sênior",
};

export const CAREERS_SOCIAL_NETWORKS: { value: CareersSocialNetwork; label: string; placeholder: string }[] = [
    { value: "website", label: "Site institucional", placeholder: "https://suaempresa.com.br" },
    { value: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
    { value: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
    { value: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
    { value: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
    { value: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
    { value: "x", label: "X (Twitter)", placeholder: "https://x.com/..." },
    { value: "glassdoor", label: "Glassdoor", placeholder: "https://glassdoor.com.br/..." },
];
