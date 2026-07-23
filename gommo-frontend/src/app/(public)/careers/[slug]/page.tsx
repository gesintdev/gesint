import { CareersApplyClient } from "@/modules/rh/person/jobvacancy/components/CareersApplyClient";

type CareersPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function CareersPage({ params }: CareersPageProps) {
    const { slug } = await params;
    return <CareersApplyClient slug={decodeURIComponent(slug)} />;
}
