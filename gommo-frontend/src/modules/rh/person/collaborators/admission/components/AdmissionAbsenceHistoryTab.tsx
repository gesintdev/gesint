"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { LEAVE_TABLE_COLUMNS } from "@/modules/rh/person/leave/config/leave-request.table-columns";
import type { LeaveRequest } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { isAbsenceLeave } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";

const ABSENCE_HISTORY_COLUMNS = LEAVE_TABLE_COLUMNS.filter((column) => column.id !== "collaboratorName");

function sortByStartDateDesc(rows: LeaveRequest[]): LeaveRequest[] {
    return [...rows].sort((a, b) => String(b.startDate ?? "").localeCompare(String(a.startDate ?? "")));
}

function AbsenceHistorySection({
    title,
    description,
    rows,
    emptyMessage,
}: {
    title: string;
    description: string;
    rows: LeaveRequest[];
    emptyMessage: string;
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
            <DataTable<LeaveRequest>
                data={rows}
                columns={ABSENCE_HISTORY_COLUMNS}
                rowKey="id"
                emptyMessage={emptyMessage}
                rowActivateOn="doubleclick"
            />
        </section>
    );
}

function EmptyAdmissionState() {
    return (
        <div className="flex min-h-[280px] items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100 px-5 py-6 text-center">
                <ClipboardList className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                <h3 className="mt-3 text-sm font-semibold text-base-content">Selecione uma admissão</h3>
                <p className="mt-1 text-sm text-base-content/55">
                    Abra uma admissão vinculada a colaborador para visualizar o histórico de afastamentos.
                </p>
            </div>
        </div>
    );
}

export function AdmissionAbsenceHistoryTab() {
    const { editingId } = useCrudScreen();
    const admissionQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: Boolean(editingId),
    });
    const absenceHistoryQuery = useQuery({
        queryKey: [...leaverequestKeys.all, "admission-absence-history", admissionQuery.data?.collaboratorId],
        queryFn: async () => {
            const rows = await leaverequestService.getAll();
            return rows
                .filter((row) => row.collaboratorId === admissionQuery.data?.collaboratorId)
                .filter(isAbsenceLeave);
        },
        enabled: Boolean(admissionQuery.data?.collaboratorId),
    });

    if (!editingId) return <EmptyAdmissionState />;

    if (admissionQuery.isLoading || absenceHistoryQuery.isLoading) {
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
                    <ClipboardList className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                    <h3 className="mt-3 text-sm font-semibold text-base-content">Colaborador ainda não vinculado</h3>
                    <p className="mt-1 text-sm text-base-content/55">
                        Conclua a admissão para liberar o histórico de afastamentos.
                    </p>
                </div>
            </div>
        );
    }

    const rows = sortByStartDateDesc(absenceHistoryQuery.data ?? []);
    const today = new Date().toISOString().slice(0, 10);
    const currentRows = rows.filter((row) => String(row.endDate ?? "") >= today);
    const pastRows = rows.filter((row) => String(row.endDate ?? "") < today);

    return (
        <div className="grid flex-1 gap-4 p-2">
            <AbsenceHistorySection
                title="Afastamentos atuais"
                description="Registros em andamento ou programados para o colaborador."
                rows={currentRows}
                emptyMessage="Nenhum afastamento atual ou programado."
            />
            <AbsenceHistorySection
                title="Afastamentos encerrados"
                description="Registros já encerrados no histórico do colaborador."
                rows={pastRows}
                emptyMessage="Nenhum afastamento encerrado registrado."
            />
        </div>
    );
}
