export const CAREERS_STATE_CODES = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const CAREERS_MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
] as const;

export const CAREERS_YEARS = Array.from({ length: 35 }, (_, index) => String(new Date().getFullYear() - index));

export const CAREERS_REFERRAL_OPTIONS = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "indeed", label: "Indeed" },
    { value: "gupy", label: "Gupy" },
    { value: "indicacao", label: "Indicação de um colaborador" },
    { value: "site", label: "Site da empresa" },
    { value: "glassdoor", label: "Glassdoor" },
    { value: "outro", label: "Outro" },
] as const;

/** `?origem=whatsapp` no link compartilhado já preenche "Como conheceu a vaga?". */
export function referralFromSearch(search: string): string {
    const origin = new URLSearchParams(search).get("origem")?.trim().toLowerCase();
    return CAREERS_REFERRAL_OPTIONS.some((item) => item.value === origin) ? origin! : "";
}

export const CAREERS_RESUME_MAX_BYTES = 10 * 1024 * 1024;
const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

export function invalidResumeMessage(file: File | null | undefined): string | null {
    if (!file) return null;
    const name = file.name.toLowerCase();
    if (!RESUME_EXTENSIONS.some((extension) => name.endsWith(extension))) {
        return "Envie o currículo em PDF, DOC ou DOCX.";
    }
    if (file.size > CAREERS_RESUME_MAX_BYTES) {
        return "O currículo deve ter no máximo 10 MB.";
    }
    return null;
}

export type CareersExperienceForm = {
    id: string;
    companyName: string;
    jobTitle: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    currentJob: boolean;
    description: string;
};

export function createEmptyExperience(): CareersExperienceForm {
    return {
        id: crypto.randomUUID(),
        companyName: "",
        jobTitle: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        currentJob: false,
        description: "",
    };
}

export function monthYearToIsoDate(monthLabel: string, year: string): string | undefined {
    if (!monthLabel || !year) return undefined;
    const monthIndex = CAREERS_MONTHS.indexOf(monthLabel as (typeof CAREERS_MONTHS)[number]);
    if (monthIndex < 0) return undefined;
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
}

export function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function phoneDigits(value: string): string {
    return value.replace(/\D/g, "");
}
