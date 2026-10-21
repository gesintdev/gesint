"use client";

import clsx from "clsx";

import type { AdmissionPipelineKpis as Kpis } from "@/modules/rh/person/collaborators/admission/dto/admission-pipeline.dto";
import { type PipelineTone, shortDateBr } from "@/modules/rh/person/collaborators/admission/lib/admission-pipeline.labels";

const ACCENT_CLASS: Record<PipelineTone, string> = {
    neutral: "border-l-base-300",
    info: "border-l-info",
    success: "border-l-success",
    warning: "border-l-warning",
    error: "border-l-error",
};

const VALUE_CLASS: Record<PipelineTone, string> = {
    neutral: "text-base-content",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
};

function KpiTile({ label, value, hint, tone }: { label: string; value: number; hint: string; tone: PipelineTone }) {
    return (
        <div
            className={clsx(
                "rounded-xl border border-l-[3px] border-(--gesint-border-subtle) bg-base-100 px-4 py-3.5 shadow-(--gesint-shadow-sm)",
                ACCENT_CLASS[tone],
            )}
        >
            <p className="text-[10px] font-semibold tracking-wide text-base-content/55 uppercase">{label}</p>
            <p className={clsx("mt-2 text-[28px] leading-none font-bold tracking-tight tabular-nums", VALUE_CLASS[tone])}>
                {value}
            </p>
            <p className="mt-2 text-[11px] leading-snug text-base-content/45">{hint}</p>
        </div>
    );
}

function pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
}

export function AdmissionPipelineKpis({ kpis }: { kpis: Kpis }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <KpiTile
                label="Em andamento"
                value={kpis.inProgress}
                hint={
                    kpis.startingWithinFifteenDays > 0
                        ? `${kpis.startingWithinFifteenDays} ${pluralize(kpis.startingWithinFifteenDays, "começa", "começam")} em até 15 dias`
                        : "Nenhum início nos próximos 15 dias"
                }
                tone="info"
            />
            <KpiTile
                label="Impedidos de iniciar"
                value={kpis.blockedFromStarting}
                hint={kpis.blockedFromStarting > 0 ? "Sem ASO admissional apto" : "Todos com exame em dia"}
                tone={kpis.blockedFromStarting > 0 ? "error" : "neutral"}
            />
            <KpiTile
                label="Prazo legal vencido"
                value={kpis.overdueDeadlines}
                hint={
                    kpis.overdueDeadlines > 0
                        ? `${kpis.overdueDeadlinePeople} ${pluralize(kpis.overdueDeadlinePeople, "pessoa", "pessoas")}`
                        : "Nenhum prazo em atraso"
                }
                tone={kpis.overdueDeadlines > 0 ? "error" : "neutral"}
            />
            <KpiTile
                label="Vence em 7 dias"
                value={kpis.dueWithinSevenDays}
                hint={kpis.nextDueDate ? `Próximo em ${shortDateBr(kpis.nextDueDate)}` : "Nada vencendo na semana"}
                tone={kpis.dueWithinSevenDays > 0 ? "warning" : "neutral"}
            />
            <KpiTile
                label="Prontos para o 1º dia"
                value={kpis.readyForFirstDay}
                hint={kpis.readyForFirstDay > 0 ? "Seis etapas concluídas" : "Nenhuma esteira concluída"}
                tone={kpis.readyForFirstDay > 0 ? "success" : "neutral"}
            />
        </div>
    );
}
