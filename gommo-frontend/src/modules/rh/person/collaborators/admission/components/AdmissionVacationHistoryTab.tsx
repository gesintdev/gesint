"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { VacationHistoryDetailModal } from "@/modules/rh/person/leave/components/VacationHistoryDetailModal";
import { LEAVE_HISTORY_TABLE_COLUMNS } from "@/modules/rh/person/leave/config/leave-history.table-columns";
import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import {
    enrichVacationHistoryRows,
    type VacationHistoryRow,
} from "@/modules/rh/person/leave/lib/leave-history.enrich";
import { isVacationHistory } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { loadVacationEligibleCollaborators } from "@/modules/rh/person/leave/lib/vacation-eligible";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { findRouteById } from "@/shared/workspace/workspace-routes";

const VACATION_HISTORY_COLUMNS = LEAVE_HISTORY_TABLE_COLUMNS.filter((column) => column.id !== "collaboratorName");
const PREFILL_STORAGE_KEY = "gommo-vacation-request-prefill";

function sortByStartDateDesc(rows: VacationHistoryRow[]): VacationHistoryRow[] {
    return [...rows].sort((a, b) => String(b.startDate ?? "").localeCompare(String(a.startDate ?? "")));
}

function VacationHistorySection({
    title,
    description,
    rows,
    emptyMessage,
    onView,
}: {
    title: string;
    description: string;
    rows: VacationHistoryRow[];
    emptyMessage: string;
    onView: (row: VacationHistoryRow) => void;
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--gommo-border-subtle)] px-4 py-3">
                <div className="min-w-0">
                    <h3 className="text-[13px] font-semibold tracking-tight text-base-content">{title}</h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">{description}</p>
                </div>
                <span className="rounded-full border border-[var(--gommo-border-subtle)] px-2 py-0.5 text-[11px] font-medium text-base-content/55">
                    {rows.length}
                </span>
            </header>
            <DataTable<VacationHistoryRow>
                data={rows}
                columns={VACATION_HISTORY_COLUMNS}
                rowKey="id"
                emptyMessage={emptyMessage}
                rowActivateOn="doubleclick"
                onRowActivate={onView}
                renderActions={(row) => (
                    <TableActionButton
                        actionVariant="open"
                        aria-label="Visualizar detalhes"
                        title="Visualizar detalhes"
                        leftIcon={<Eye className="size-3.5" />}
                        onClick={(event) => {
                            event.stopPropagation();
                            onView(row);
                        }}
                    />
                )}
            />
        </section>
    );
}

function EmptyAdmissionState() {
    return (
        <div className="flex min-h-[280px] items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100 px-5 py-6 text-center">
                <CalendarDays className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                <h3 className="mt-3 text-sm font-semibold text-base-content">Selecione uma admissão</h3>
                <p className="mt-1 text-sm text-base-content/55">
                    Abra uma admissão vinculada a colaborador para visualizar o histórico de férias.
                </p>
            </div>
        </div>
    );
}

export function AdmissionVacationHistoryTab() {
    const { editingId } = useCrudScreen();
    const { openRouteCreate } = useWorkspaceNavigation();
    const [selected, setSelected] = useState<VacationHistoryRow | null>(null);
    const admissionQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: Boolean(editingId),
    });
    const vacationHistoryQuery = useQuery({
        queryKey: [...leaverequestKeys.all, "admission-vacation-history", admissionQuery.data?.collaboratorId],
        queryFn: async () => {
            const rows = await leaverequestService.getAll();
            return enrichVacationHistoryRows(
                rows
                    .filter((row) => row.collaboratorId === admissionQuery.data?.collaboratorId)
                    .filter(isVacationHistory),
            );
        },
        enabled: Boolean(admissionQuery.data?.collaboratorId),
    });
    const eligibleQuery = useQuery({
        queryKey: [...leaverequestKeys.all, "vacation-eligible"],
        queryFn: loadVacationEligibleCollaborators,
        enabled: Boolean(admissionQuery.data?.collaboratorId),
    });

    const rows = useMemo(
        () => sortByStartDateDesc(vacationHistoryQuery.data ?? []),
        [vacationHistoryQuery.data],
    );

    if (!editingId) return <EmptyAdmissionState />;

    if (admissionQuery.isLoading || vacationHistoryQuery.isLoading || eligibleQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" style={{ animationDelay: `${i * 70}ms` }} />
                ))}
            </div>
        );
    }

    if (admissionQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        admissionQuery.error,
                        ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED,
                    )}
                </p>
            </div>
        );
    }

    const collaboratorId = admissionQuery.data?.collaboratorId;

    if (!collaboratorId) {
        return (
            <div className="flex min-h-[280px] items-center justify-center p-6">
                <div className="max-w-md rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100 px-5 py-6 text-center">
                    <CalendarDays className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                    <h3 className="mt-3 text-sm font-semibold text-base-content">Colaborador ainda não vinculado</h3>
                    <p className="mt-1 text-sm text-base-content/55">
                        Conclua a admissão para liberar o histórico e o lançamento de férias.
                    </p>
                </div>
            </div>
        );
    }

    const eligible = eligibleQuery.data?.find((row) => row.collaboratorId === collaboratorId);
    const today = new Date().toISOString().slice(0, 10);
    const currentRows = rows.filter((row) => String(row.endDate ?? "") >= today);
    const takenRows = rows.filter((row) => String(row.endDate ?? "") < today);
    const launchVacation = () => {
        if (!eligible) return;
        window.sessionStorage.setItem(
            PREFILL_STORAGE_KEY,
            JSON.stringify({
                collaboratorId: eligible.collaboratorId,
                unjustifiedAbsences: eligible.unjustifiedAbsences,
                justifiedAbsences: eligible.justifiedAbsences,
                acquisitionPeriodStart: eligible.acquisitionStart,
                acquisitionPeriodEnd: eligible.acquisitionEnd,
                recessPeriodId: eligible.recessPeriodId,
                recessAllowSplit: eligible.recessAllowSplit,
                recessMaxSplitPeriods: eligible.recessMaxSplitPeriods,
                recessMinimumSplitDays: eligible.recessMinimumSplitDays,
                vacationDaysEntitled: eligible.entitledDays,
            }),
        );
        const route = findRouteById(LEAVE_VACATION_CRUD_LABELS.routeId);
        if (route) openRouteCreate(route, LEAVE_VACATION_CRUD_LABELS.tabShortLabel);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="grid flex-1 gap-4 p-2">
                <VacationHistorySection
                    title="Férias atuais"
                    description="Períodos aprovados em andamento ou programados."
                    rows={currentRows}
                    emptyMessage="Nenhuma férias atual ou programada."
                    onView={setSelected}
                />
                <VacationHistorySection
                    title="Férias gozadas"
                    description="Períodos aprovados já encerrados."
                    rows={takenRows}
                    emptyMessage="Nenhuma férias gozada registrada."
                    onView={setSelected}
                />
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-[var(--gommo-border-subtle)] bg-base-100 px-4 py-3">
                <p className="text-xs text-base-content/50">
                    {eligible
                        ? "Colaborador apto para lançamento de férias."
                        : "Colaborador sem período apto para lançamento de férias no momento."}
                </p>
                <Button
                    type="button"
                    size="sm"
                    disabled={!eligible}
                    leftIcon={<CalendarPlus className="size-3.5" strokeWidth={2} />}
                    onClick={launchVacation}
                >
                    Lançar férias
                </Button>
            </footer>
            <VacationHistoryDetailModal
                row={selected}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
            />
        </div>
    );
}
