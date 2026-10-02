import type { CareersVacancy } from "@/modules/careers/shared/dto/careers.dto";

const EMPLOYMENT_TYPE: Record<string, string> = {
    CLT: "FULL_TIME",
    PJ: "CONTRACTOR",
    ESTAGIO: "INTERN",
    TEMPORARIO: "TEMPORARY",
    FREELANCER: "CONTRACTOR",
};

/** schema.org JobPosting — habilita a vaga no Google for Jobs. */
export function buildJobPostingJsonLd(vacancy: CareersVacancy, origin: string | null, logoUrl: string | null) {
    const organization = vacancy.branding.displayName?.trim() || vacancy.organizationName;
    const description = [vacancy.description, vacancy.activities, vacancy.requirements, vacancy.benefits]
        .filter(Boolean)
        .join("\n\n");

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: vacancy.jobTitle,
        description: description || vacancy.jobTitle,
        datePosted: vacancy.publishedAt ?? undefined,
        validThrough: vacancy.expectedCompletionDate ? `${vacancy.expectedCompletionDate}T23:59:59` : undefined,
        employmentType: vacancy.contractType ? EMPLOYMENT_TYPE[vacancy.contractType] : undefined,
        hiringOrganization: {
            "@type": "Organization",
            name: organization,
            sameAs: vacancy.branding.socialLinks?.website ?? undefined,
            logo: logoUrl ?? undefined,
        },
        directApply: true,
        url: origin ? `${origin}/careers/${encodeURIComponent(vacancy.slug)}` : undefined,
    };

    if (vacancy.workModality === "REMOTO") {
        jsonLd.jobLocationType = "TELECOMMUTE";
        jsonLd.applicantLocationRequirements = { "@type": "Country", name: "BR" };
    } else if (vacancy.location) {
        jsonLd.jobLocation = {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: vacancy.location, addressCountry: "BR" },
        };
    }

    if (vacancy.salary != null || vacancy.salaryMax != null) {
        jsonLd.baseSalary = {
            "@type": "MonetaryAmount",
            currency: "BRL",
            value: {
                "@type": "QuantitativeValue",
                minValue: vacancy.salary ?? undefined,
                maxValue: vacancy.salaryMax ?? undefined,
                unitText: "MONTH",
            },
        };
    }

    return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}
