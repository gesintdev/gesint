"use client";

import {
    BarChart3,
    CalendarOff,
    Clock3,
    FileChartColumn,
    Filter,
    Lightbulb,
    Search,
    Sparkles,
    Stethoscope,
    UserRoundPlus,
    Users,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAccountPreferences } from "@/modules/cfg/account/hooks/useAccountPreferences";
import type { PdfDeliveryMode } from "@/modules/cfg/account/services/account.service";
import { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { ReportCatalogCard, type ReportCatalogItem } from "@/modules/shared/reports/components/ReportCatalogCard";
import {
    type PeriodReportFilter,
    type ReportKey,
    reportService,
} from "@/modules/shared/reports/services/report.service";
import { hasPermission, usePermissionsForSystem } from "@/shared/auth/permissions";
import { WorkspaceHeroArt, WorkspaceHeroPage } from "@/shared/components/layout/WorkspaceHeroPage";
import { Button } from "@/shared/components/ui/Button";
import { InputDate } from "@/shared/components/ui/input/InputDate";
import { InputString } from "@/shared/components/ui/input/InputString";
import { closeReservedPdfWindow, deliverPdf, reservePdfWindow } from "@/shared/lib/pdf/pdf-delivery";

type ReportDefinition = ReportCatalogItem & {
    reportKey?: ReportKey;
    permission: string;
    filename: (_filter?: PeriodReportFilter) => string;
    requiresPeriod?: boolean;
};

type ReportSystem = SystemEnum.DP | SystemEnum.RH;

const DP_REPORTS: ReportDefinition[] = [
    {
        id: "employee-roster",
        reportKey: "EMPLOYEE_ROSTER",
        title: "Cadastro de Colaboradores",
        description: "Lista completa de colaboradores com dados cadastrais.",
        category: "Colaboradores",
        permission: "collaborator:export",
        filename: () => "relatorio-funcionarios.pdf",
        icon: Users,
    },
    {
        id: "time-sheet",
        title: "Espelho de Ponto",
        description: "Detalhamento das marcações de ponto dos colaboradores.",
        category: "Ponto",
        permission: "attendance:read",
        filename: () => "espelho-ponto.pdf",
        icon: Clock3,
        development: true,
    },
    {
        id: "occupational-exams",
        title: "Exames Ocupacionais",
        description: "Relação de exames realizados no período selecionado.",
        category: "SST",
        permission: "occupationalexam:read",
        filename: () => "exames-ocupacionais.pdf",
        icon: Stethoscope,
        development: true,
    },
    {
        id: "leaves",
        reportKey: "LEAVES",
        title: "Relatório de Afastamentos",
        description: "Lista de afastamentos por período, sem exposição de dados médicos.",
        category: "Afastamentos",
        permission: "leave:export",
        filename: (filter) => `afastamentos-${filter?.startDate}-a-${filter?.endDate}.pdf`,
        icon: CalendarOff,
        requiresPeriod: true,
    },
];

const RH_REPORTS: ReportDefinition[] = [
    {
        id: "people-movements",
        reportKey: "ADMISSIONS",
        title: "Movimentações de Pessoal",
        description: "Admissões previstas e concluídas, organizadas por cargo e departamento.",
        category: "Admissão e demissão",
        permission: "admission:export",
        filename: (filter) => `admissoes-${filter?.startDate}-a-${filter?.endDate}.pdf`,
        icon: UserRoundPlus,
        requiresPeriod: true,
    },
    {
        id: "development-plan",
        title: "Plano de Desenvolvimento",
        description: "Acompanhamento dos planos de desenvolvimento dos colaboradores.",
        category: "PDI",
        permission: "developmentplan:read",
        filename: () => "planos-desenvolvimento.pdf",
        icon: Sparkles,
        development: true,
    },
    {
        id: "indicator-summary",
        title: "Resumo de Indicadores",
        description: "Principais indicadores operacionais de Recursos Humanos.",
        category: "Indicadores",
        permission: "dashboard:read",
        filename: () => "resumo-indicadores.pdf",
        icon: BarChart3,
        development: true,
    },
];

const REPORTS_BY_SYSTEM: Record<ReportSystem, ReportDefinition[]> = {
    [SystemEnum.DP]: DP_REPORTS,
    [SystemEnum.RH]: RH_REPORTS,
};

function todayIso(): string {
    const today = new Date();
    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
}

function monthStartIso(): string {
    const today = new Date();
    return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), "01"].join("-");
}

export function ReportsWorkspacePage({ system }: { system: ReportSystem }) {
    const permissions = usePermissionsForSystem(system);
    const preferences = useAccountPreferences();
    const [draftPeriod, setDraftPeriod] = useState<PeriodReportFilter>({
        startDate: monthStartIso(),
        endDate: todayIso(),
    });
    const [appliedPeriod, setAppliedPeriod] = useState<PeriodReportFilter>(draftPeriod);
    const [query, setQuery] = useState("");
    const [generating, setGenerating] = useState<string | null>(null);

    const reports = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
        return REPORTS_BY_SYSTEM[system].filter((report) => {
            if (!report.development && !hasPermission(permissions, report.permission)) return false;
            if (!normalizedQuery) return true;
            return [report.title, report.description, report.category].some((value) =>
                value.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
            );
        });
    }, [permissions, query, system]);

    const systemName = system === SystemEnum.RH ? "Recursos Humanos" : "Departamento Pessoal";
    const idPrefix = `${system}-reports`;

    const periodIsValid = (period: PeriodReportFilter) =>
        Boolean(period.startDate && period.endDate && period.endDate >= period.startDate);

    const generate = async (report: ReportDefinition, mode: PdfDeliveryMode) => {
        if (!report.reportKey || report.development) return;
        if (report.requiresPeriod && !periodIsValid(appliedPeriod)) {
            toast.error("Informe um período válido");
            return;
        }

        let popup: Window | null = null;
        try {
            popup = reservePdfWindow(mode);
            setGenerating(report.id);
            const filter = report.requiresPeriod ? appliedPeriod : undefined;
            const blob = await reportService.generate(report.reportKey, filter);
            deliverPdf(blob, mode, report.filename(filter), popup);
            toast.success(mode === "DOWNLOAD" ? "Relatório baixado" : "Relatório aberto em nova aba");
        } catch (error) {
            closeReservedPdfWindow(popup);
            toast.error(
                error instanceof Error && error.message === "POPUP_BLOCKED"
                    ? "O navegador bloqueou a nova aba. Libere pop-ups para o Gesint."
                    : "Não foi possível gerar o relatório",
            );
        } finally {
            setGenerating(null);
        }
    };

    const applyFilters = () => {
        if (!periodIsValid(draftPeriod)) {
            toast.error("Informe um período válido");
            return;
        }
        setAppliedPeriod(draftPeriod);
        toast.success("Filtros aplicados");
    };

    const clearFilters = () => {
        const initialPeriod = { startDate: monthStartIso(), endDate: todayIso() };
        setDraftPeriod(initialPeriod);
        setAppliedPeriod(initialPeriod);
    };

    return (
        <WorkspaceHeroPage
            title="Relatórios"
            subtitle={`Acesse e gere relatórios de ${systemName} de forma rápida, prática e segura.`}
            icon={<FileChartColumn className="size-6" strokeWidth={2} />}
            art={
                <WorkspaceHeroArt
                    icon={<BarChart3 className="size-12" strokeWidth={1.7} />}
                    badge={<FileChartColumn className="size-5" />}
                />
            }
        >
                <section className="gesint-report-filters" aria-labelledby={`${idPrefix}-filters-title`}>
                    <div className="gesint-report-filters__heading">
                        <span className="gesint-report-filters__icon" aria-hidden="true">
                            <Filter className="size-4" />
                        </span>
                        <div>
                            <h2 id={`${idPrefix}-filters-title`}>Filtros globais (opcional)</h2>
                            <p>
                                Use estas opções nos relatórios compatíveis. A filial ativa já é considerada
                                automaticamente.
                            </p>
                        </div>
                    </div>

                    <div className="gesint-report-filters__body">
                        <div className="gesint-report-filters__fields">
                            <InputDate
                                label="Data inicial"
                                value={draftPeriod.startDate}
                                max={draftPeriod.endDate || undefined}
                                onValueChange={(startDate) =>
                                    setDraftPeriod((current) => ({ ...current, startDate }))
                                }
                            />
                            <InputDate
                                label="Data final"
                                value={draftPeriod.endDate}
                                min={draftPeriod.startDate || undefined}
                                onValueChange={(endDate) => setDraftPeriod((current) => ({ ...current, endDate }))}
                            />
                        </div>

                        <div className="gesint-report-filters__actions">
                            <Button
                                variant="secondary"
                                leftIcon={<X className="size-3.5" />}
                                onClick={clearFilters}
                            >
                                Limpar
                            </Button>
                            <Button
                                variant="primary"
                                leftIcon={<Filter className="size-3.5" />}
                                onClick={applyFilters}
                            >
                                Aplicar filtros
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="gesint-report-catalog" aria-labelledby={`${idPrefix}-catalog-title`}>
                    <div className="gesint-report-catalog__heading">
                        <div className="gesint-report-catalog__title">
                            <span aria-hidden="true">
                                <BarChart3 className="size-4" />
                            </span>
                            <div>
                                <h2 id={`${idPrefix}-catalog-title`}>Nossos relatórios</h2>
                                <p>Escolha um relatório para visualizar ou gerar o PDF.</p>
                            </div>
                        </div>

                        <div className="gesint-report-catalog__search">
                            <label className="sr-only" htmlFor={`${idPrefix}-search`}>
                                Buscar relatórios
                            </label>
                            <InputString
                                id={`${idPrefix}-search`}
                                type="search"
                                value={query}
                                onValueChange={setQuery}
                                placeholder="Buscar relatórios..."
                                leftIcon={<Search className="size-4" />}
                            />
                        </div>
                    </div>

                    <div className="gesint-report-catalog__grid">
                        {reports.map((report) => {
                            const isLoading = generating === report.id;
                            const isDisabled = preferences.isLoading || (generating !== null && !isLoading);
                            return (
                                <ReportCatalogCard
                                    key={report.id}
                                    report={report}
                                    loading={isLoading}
                                    disabled={isDisabled}
                                    onPreview={() => void generate(report, "NEW_TAB")}
                                    onGenerate={() =>
                                        void generate(report, preferences.data?.reportPdfDeliveryMode ?? "DOWNLOAD")
                                    }
                                />
                            );
                        })}
                    </div>

                    {reports.length === 0 && (
                        <div className="gesint-report-catalog__empty">
                            Nenhum relatório corresponde à sua busca.
                        </div>
                    )}
                </section>

                <aside className="gesint-report-tip">
                    <span aria-hidden="true">
                        <Lightbulb className="size-4" />
                    </span>
                    <p>
                        <strong>Dica</strong>
                        Você pode ajustar os filtros de cada relatório individualmente quando necessário.
                    </p>
                </aside>
        </WorkspaceHeroPage>
    );
}
