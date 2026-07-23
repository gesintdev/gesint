export const BRAZIL_STATE_CODES = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
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
    { value: "indeed", label: "Indeed" },
    { value: "gupy", label: "Gupy" },
    { value: "indicacao", label: "Indicação de um colaborador" },
    { value: "site", label: "Site da empresa" },
    { value: "glassdoor", label: "Glassdoor" },
    { value: "outro", label: "Outro" },
] as const;

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

export function createEmptyCareersExperience(): CareersExperienceForm {
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

export function splitLines(value?: string | null): string[] {
    if (!value) return [];
    return value
        .split(/\r?\n|;/)
        .map((line) => line.trim())
        .filter(Boolean);
}

export function formatSalaryRange(min?: number | null, max?: number | null): string | null {
    const format = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
            value,
        );
    if (min != null && max != null) return `${format(min)} – ${format(max)}`;
    if (min != null) return format(min);
    if (max != null) return format(max);
    return null;
}

export function formatPublishedLabel(publishedAt?: string | null): string | null {
    if (!publishedAt) return null;
    const date = new Date(publishedAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("pt-BR");
}
