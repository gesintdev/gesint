import type { Metadata } from "next";

import { careersAssetUrl } from "@/modules/careers/shared/lib/careers-assets";
import { CareersVacancyPageClient } from "@/modules/careers/site/components/CareersVacancyPageClient";
import { buildJobPostingJsonLd } from "@/modules/careers/site/lib/careers-json-ld";
import { fetchCareersVacancy, resolveRequestOrigin } from "@/modules/careers/site/server/careers-site.server";

type CareersVacancyPageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CareersVacancyPageProps): Promise<Metadata> {
    const { slug } = await params;
    const vacancy = await fetchCareersVacancy(decodeURIComponent(slug));
    if (!vacancy) {
        return { title: "Vaga | Carreiras" };
    }
    const organization = vacancy.branding.displayName?.trim() || vacancy.organizationName;
    const title = organization ? `${vacancy.jobTitle} | ${organization}` : vacancy.jobTitle;
    const description =
        [vacancy.location, vacancy.department].filter(Boolean).join(" · ") ||
        `Candidate-se à vaga de ${vacancy.jobTitle}.`;
    const origin = await resolveRequestOrigin();
    const logo = careersAssetUrl(vacancy.branding.logoObjectId);
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            url: origin ? `${origin}/careers/${encodeURIComponent(vacancy.slug)}` : undefined,
            images: logo && origin ? [{ url: `${origin}${logo}` }] : undefined,
        },
    };
}

export default async function CareersVacancyPage({ params }: CareersVacancyPageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const vacancy = await fetchCareersVacancy(decodedSlug);
    const origin = vacancy ? await resolveRequestOrigin() : null;
    const logo = vacancy ? careersAssetUrl(vacancy.branding.logoObjectId) : null;

    return (
        <>
            {vacancy && vacancy.publishGoogleJobs !== false ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: buildJobPostingJsonLd(vacancy, origin, logo && origin ? `${origin}${logo}` : null),
                    }}
                />
            ) : null}
            <CareersVacancyPageClient slug={decodedSlug} initialData={vacancy} />
        </>
    );
}
