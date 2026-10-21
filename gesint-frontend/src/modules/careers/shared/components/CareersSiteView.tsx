"use client";

import type { ReactNode } from "react";

import { CareersBlockRenderer } from "@/modules/careers/shared/components/CareersBlockRenderer";
import {
    CareersSiteFooter,
    CareersSiteHeader,
    CareersThemeScope,
} from "@/modules/careers/shared/components/CareersSiteChrome";
import type { CareersBlock, CareersBranding, CareersVacancySummary } from "@/modules/careers/shared/dto/careers.dto";

type CareersSiteViewProps = {
    organizationName: string;
    branding?: Partial<CareersBranding> | null;
    blocks: CareersBlock[];
    vacancies: CareersVacancySummary[];
    preview?: boolean;
    headerActions?: ReactNode;
    className?: string;
};

/** Página da empresa (/careers). Mesmo componente no site público e no preview do editor. */
export function CareersSiteView({
    organizationName,
    branding,
    blocks,
    vacancies,
    preview,
    headerActions,
    className,
}: CareersSiteViewProps) {
    const visibleBlocks = blocks.filter((block) => block.visible !== false);
    const talentPoolVisible = visibleBlocks.some((block) => block.type === "TALENT_POOL");

    return (
        <CareersThemeScope branding={branding} className={className ?? "min-h-screen"}>
            <CareersSiteHeader
                branding={branding}
                organizationName={organizationName}
                preview={preview}
                actions={headerActions}
            />
            <main>
                {visibleBlocks.map((block, index) => (
                    <CareersBlockRenderer
                        key={block.id ?? `${block.type}-${index}`}
                        block={block}
                        organizationName={organizationName}
                        vacancies={vacancies}
                        preview={preview}
                        talentPoolVisible={talentPoolVisible}
                    />
                ))}
            </main>
            <CareersSiteFooter branding={branding} organizationName={organizationName} />
        </CareersThemeScope>
    );
}
