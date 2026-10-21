import type { Metadata } from "next";

import { careersAssetUrl } from "@/modules/careers/shared/lib/careers-assets";
import { CareersCompanyPageClient } from "@/modules/careers/site/components/CareersCompanyPageClient";
import { fetchCareersSite, resolveRequestOrigin } from "@/modules/careers/site/server/careers-site.server";

export async function generateMetadata(): Promise<Metadata> {
    const site = await fetchCareersSite();
    if (!site) {
        return { title: "Carreiras" };
    }
    const name = site.branding.displayName?.trim() || site.organizationName || "Carreiras";
    const title = site.branding.seoTitle?.trim() || `Trabalhe na ${name}`;
    const description =
        site.branding.seoDescription?.trim() ||
        `Conheça a ${name} e as ${site.vacancies.length} vagas abertas. Candidate-se em poucos minutos.`;
    const origin = await resolveRequestOrigin();
    const logo = careersAssetUrl(site.branding.logoObjectId);
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            url: origin ? `${origin}/careers` : undefined,
            images: logo && origin ? [{ url: `${origin}${logo}` }] : undefined,
        },
    };
}

export default async function CareersCompanyPage() {
    const site = await fetchCareersSite();
    return <CareersCompanyPageClient initialData={site} />;
}
