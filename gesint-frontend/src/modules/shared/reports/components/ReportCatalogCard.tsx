"use client";

import type { LucideIcon } from "lucide-react";
import { Eye, FileDown, MoreVertical } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

export type ReportCatalogItem = {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: LucideIcon;
    development?: boolean;
};

type ReportCatalogCardProps = {
    report: ReportCatalogItem;
    loading?: boolean;
    disabled?: boolean;
    onPreview?: () => void;
    onGenerate?: () => void;
};

export function ReportCatalogCard({
    report,
    loading = false,
    disabled = false,
    onPreview,
    onGenerate,
}: ReportCatalogCardProps) {
    const Icon = report.icon;
    const unavailable = report.development || disabled;

    return (
        <article
            className="gesint-report-card"
            aria-label={`${report.title}${report.development ? ", em desenvolvimento" : ""}`}
        >
            <div className="gesint-report-card__content">
                <div className="gesint-report-card__topline">
                    <span className="gesint-report-card__icon" aria-hidden="true">
                        <Icon className="size-5" strokeWidth={2} />
                    </span>

                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                        <span className="gesint-report-card__category">{report.category}</span>
                        {report.development && <span className="gesint-report-card__status">Em desenvolvimento</span>}
                    </div>

                    <span className="gesint-report-card__menu" aria-hidden="true">
                        <MoreVertical className="size-4" />
                    </span>
                </div>

                <div className="min-w-0">
                    <h3 className="gesint-report-card__title">{report.title}</h3>
                    <p className="gesint-report-card__description">{report.description}</p>
                </div>
            </div>

            <div className="gesint-report-card__actions">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gesint-report-card__preview"
                    leftIcon={<Eye className="size-3.5" />}
                    disabled={unavailable || loading}
                    onClick={onPreview}
                >
                    Visualizar modelo
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    className="gesint-report-card__generate"
                    leftIcon={<FileDown className="size-3.5" />}
                    loading={loading}
                    disabled={unavailable}
                    onClick={onGenerate}
                >
                    Gerar PDF
                </Button>
            </div>
        </article>
    );
}
