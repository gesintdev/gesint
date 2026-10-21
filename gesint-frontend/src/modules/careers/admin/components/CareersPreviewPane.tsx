"use client";

import clsx from "clsx";
import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

import type { CareersPageTheme } from "@/modules/careers/admin/dto/careers-page.dto";
import type { CareersEditorBlock } from "@/modules/careers/admin/lib/careers-editor";
import { CareersSiteView } from "@/modules/careers/shared/components/CareersSiteView";
import type { CareersVacancySummary } from "@/modules/careers/shared/dto/careers.dto";

type Viewport = "mobile" | "desktop";

type CareersPreviewPaneProps = {
    theme: CareersPageTheme;
    blocks: CareersEditorBlock[];
    organizationName: string;
    vacancies: CareersVacancySummary[];
    usingSampleVacancies: boolean;
};

export function CareersPreviewPane({
    theme,
    blocks,
    organizationName,
    vacancies,
    usingSampleVacancies,
}: CareersPreviewPaneProps) {
    const [viewport, setViewport] = useState<Viewport>("mobile");
    const branding = { ...theme, showSalary: theme.showSalary };
    const visibleVacancies = theme.showSalary
        ? vacancies
        : vacancies.map((vacancy) => ({ ...vacancy, salary: null, salaryMax: null }));

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-base-200/60">
            <div className="flex items-center justify-between gap-3 border-b border-(--gesint-border-subtle) bg-base-100 px-4 py-2">
                <p className="text-xs text-base-content/55">
                    Pré-visualização do rascunho
                    {usingSampleVacancies ? " · vagas de exemplo (nenhuma vaga pública ainda)" : ""}
                </p>
                <div className="flex rounded-lg border border-(--gesint-border-subtle) p-0.5" role="group" aria-label="Tamanho da tela">
                    {(
                        [
                            { value: "mobile", label: "Celular", icon: Smartphone },
                            { value: "desktop", label: "Computador", icon: Monitor },
                        ] as const
                    ).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={viewport === option.value}
                            onClick={() => setViewport(option.value)}
                            className={clsx(
                                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                                viewport === option.value
                                    ? "bg-base-200 text-base-content"
                                    : "text-base-content/55 hover:text-base-content",
                            )}
                        >
                            <option.icon className="size-3.5" strokeWidth={2} />
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
                <div
                    className={clsx(
                        "mx-auto overflow-hidden rounded-xl border border-(--gesint-border-subtle) shadow-sm transition-[max-width] duration-200",
                        viewport === "mobile" ? "max-w-[390px]" : "max-w-full",
                    )}
                >
                    <CareersSiteView
                        preview
                        organizationName={organizationName}
                        branding={branding}
                        blocks={blocks}
                        vacancies={visibleVacancies}
                        className="min-h-[640px]"
                    />
                </div>
            </div>
        </div>
    );
}
