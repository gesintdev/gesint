"use client";

import { useQuery } from "@tanstack/react-query";

import { CareersSiteView } from "@/modules/careers/shared/components/CareersSiteView";
import type { CareersSite } from "@/modules/careers/shared/dto/careers.dto";
import { careersSiteKeys, careersSiteService } from "@/modules/careers/site/services/careers-site.service";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import { ExceptionCapture } from "@/shared/exceptions";

export function CareersCompanyPageClient({ initialData }: { initialData?: CareersSite | null }) {
    const siteQuery = useQuery({
        queryKey: careersSiteKeys.site,
        queryFn: () => careersSiteService.getSite(),
        initialData: initialData ?? undefined,
        retry: false,
    });

    if (siteQuery.isLoading) {
        return (
            <div className="min-h-screen bg-base-200">
                <div className="h-14 border-b border-base-content/10 bg-base-100" />
                <div className="skeleton-shimmer h-72" />
                <div className="mx-auto grid max-w-5xl gap-3 p-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (siteQuery.isError || !siteQuery.data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
                <div className="w-full max-w-lg rounded-2xl border border-base-content/10 bg-base-100 p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-base-content">Página indisponível</h1>
                    <p className="mt-2 text-sm text-base-content/60">
                        {ExceptionCapture.displayMessage(
                            siteQuery.error,
                            "Não foi possível carregar as vagas agora. Tente novamente em instantes.",
                        )}
                    </p>
                </div>
            </div>
        );
    }

    const site = siteQuery.data;
    return (
        <CareersSiteView
            organizationName={site.organizationName}
            branding={site.branding}
            blocks={site.blocks}
            vacancies={site.vacancies}
            headerActions={<ThemeToggle />}
        />
    );
}
