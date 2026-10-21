"use client";

import type { ReactNode } from "react";

import type { JobVacancy } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import {
    formatSalaryRange,
    splitLines,
} from "@/modules/rh/person/jobvacancy/lib/careers-form.util";
import {
    JOB_BOARD_OPTIONS,
    JOB_VACANCY_CONTRACT_TYPE_LABELS,
    JOB_VACANCY_SENIORITY_LABELS,
    JOB_VACANCY_WORK_MODALITY_LABELS,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";
import { formatCellValue } from "@/shared/lib/table/format-cell-value";
import { TableDataType } from "@/shared/types/table.types";

function InfoItem({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className={className ?? "text-[9pt] min-w-0 flex items-center gap-2"}>
            <p className="text-base-content/45">{`${label}:`}</p>
            <p className="font-normal text-base-content [font-variation-settings:'wght'_400]">
                {value || "—"}
            </p>
        </div>
    );
}

function InfoLink({
    label,
    href,
    className,
}: {
    label: string;
    href?: string | null;
    className?: string;
}) {
    const trimmed = href?.trim();
    return (
        <div className={className ?? "text-[9pt] min-w-0 flex items-center gap-2"}>
            <p className="text-base-content/45">{`${label}:`}</p>
            {trimmed ? (
                <a
                    href={trimmed}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-normal text-primary [font-variation-settings:'wght'_400] hover:underline"
                >
                    {trimmed}
                </a>
            ) : (
                <p className="font-normal text-base-content [font-variation-settings:'wght'_400]">—</p>
            )}
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="grid gap-3">
            <div>
                <h4 className="text-sm font-semibold text-base-content">{title}</h4>
                <div className="mt-2 border-t border-base-content/10" />
            </div>
            {children}
        </section>
    );
}

function BulletList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
    if (items.length === 0) {
        return <p className="text-xs text-base-content/45">{emptyMessage}</p>;
    }
    return (
        <ul className="grid gap-1.5">
            {items.map((item) => (
                <li key={item} className="text-xs leading-relaxed text-base-content/75">
                    {item}
                </li>
            ))}
        </ul>
    );
}

function publicCareersPath(vacancy: JobVacancy): string | null {
    if (!vacancy.isPublic || !vacancy.slug?.trim()) return null;
    return `/careers/${encodeURIComponent(vacancy.slug.trim())}`;
}

type JobVacancyProfileViewProps = {
    vacancy: JobVacancy;
};

export function JobVacancyProfileView({ vacancy }: JobVacancyProfileViewProps) {
    const salary = formatSalaryRange(vacancy.salary, vacancy.salaryMax) ?? "—";
    const careersPath = publicCareersPath(vacancy);
    const boardLabels = (vacancy.targetBoards ?? [])
        .map((key) => JOB_BOARD_OPTIONS.find((board) => board.key === key)?.label ?? key)
        .filter(Boolean);
    const activities = splitLines(vacancy.activities);
    const assignments = splitLines(vacancy.assignments);
    const requirements = splitLines(vacancy.requirements);
    const benefits = splitLines(vacancy.benefits);

    return (
        <div className="grid gap-6">
            <section className="grid gap-4">
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    <InfoItem label="Código" value={vacancy.code != null ? String(vacancy.code) : "—"} />
                    <InfoItem
                        label="Status"
                        value={formatCellValue(vacancy.status, TableDataType.BADGE)}
                    />
                    <InfoItem label="Cargo" value={vacancy.jobTitle ?? "—"} />
                    <InfoItem
                        label="Posições"
                        value={vacancy.positionsCount != null ? String(vacancy.positionsCount) : "—"}
                    />
                    <InfoItem
                        label="Senioridade"
                        value={
                            vacancy.seniorityLevel
                                ? JOB_VACANCY_SENIORITY_LABELS[vacancy.seniorityLevel]
                                : "—"
                        }
                    />
                    <InfoItem label="Salário" value={salary} />
                    <InfoItem label="Área / departamento" value={vacancy.department ?? "—"} />
                    <InfoItem label="Local" value={vacancy.location ?? "—"} />
                    <InfoItem
                        label="Modalidade"
                        value={
                            vacancy.workModality
                                ? JOB_VACANCY_WORK_MODALITY_LABELS[vacancy.workModality]
                                : "—"
                        }
                    />
                    <InfoItem
                        label="Tipo de contrato"
                        value={
                            vacancy.contractType
                                ? JOB_VACANCY_CONTRACT_TYPE_LABELS[vacancy.contractType]
                                : "—"
                        }
                    />
                    <InfoItem label="Jornada" value={vacancy.workSchedule ?? "—"} />
                    <InfoItem
                        label="Previsão de conclusão"
                        value={formatCellValue(vacancy.expectedCompletionDate, TableDataType.DATE)}
                    />
                    <InfoItem
                        label="Página pública"
                        value={vacancy.isPublic ? "Sim" : "Não"}
                    />
                    <InfoItem
                        label="Candidatos"
                        value={vacancy.candidateCount != null ? String(vacancy.candidateCount) : "0"}
                    />
                    <InfoLink
                        label="Link público"
                        href={careersPath}
                        className="min-w-0 sm:col-span-2 flex items-center gap-2"
                    />
                    <InfoItem
                        label="Sites de divulgação"
                        value={boardLabels.length > 0 ? boardLabels.join(", ") : "—"}
                        className="min-w-0 sm:col-span-2 flex items-center gap-2"
                    />
                    <InfoItem
                        label="Criado em"
                        value={formatCellValue(vacancy.createdAt, TableDataType.DATETIME)}
                    />
                    <InfoItem
                        label="Atualizado em"
                        value={formatCellValue(vacancy.updatedAt, TableDataType.DATETIME)}
                    />
                </div>
            </section>

            <DetailSection title="Descrição">
                {vacancy.description?.trim() ? (
                    <MarkdownContent value={vacancy.description} />
                ) : (
                    <p className="text-xs text-base-content/45">Nenhuma descrição cadastrada.</p>
                )}
            </DetailSection>

            <DetailSection title="Atividades">
                <BulletList items={activities} emptyMessage="Nenhuma atividade cadastrada." />
            </DetailSection>

            <DetailSection title="Atribuições">
                <BulletList items={assignments} emptyMessage="Nenhuma atribuição cadastrada." />
            </DetailSection>

            <DetailSection title="Requisitos">
                <BulletList items={requirements} emptyMessage="Nenhum requisito cadastrado." />
            </DetailSection>

            <DetailSection title="Benefícios">
                <BulletList items={benefits} emptyMessage="Nenhum benefício cadastrado." />
            </DetailSection>
        </div>
    );
}
