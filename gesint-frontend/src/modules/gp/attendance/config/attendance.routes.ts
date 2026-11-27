import { CalendarDays, ClipboardCheck, Clock, FileClock, Hourglass } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute, lazyNamed, tabbedCrudRoute } from "@/shared/routing";

/** Gestão de Ponto › Gestão de ponto. Lê colaboradores (DP/RH) e escalas (CFG); não os edita. */
export const timeManagementRoutes: AppRoute[] = [
    tabbedCrudRoute({
        id: "attendance",
        href: "/attendance",
        label: "Controle de ponto",
        icon: Clock,
        permission: "attendance:read",
        routeId: "attendance",
        tabShortLabel: "Ponto",
        formTabLabel: "Histórico de ponto",
        formTabLabelEdit: "Histórico de ponto",
        listToFormLabel: "Histórico de ponto",
        listToolbar:
            "Resumo do período por colaborador. Banco de horas em verde quando positivo e em vermelho quando negativo.",
        list: lazyNamed(
            () => import("@/modules/gp/attendance/components/AttendanceRecordListClient"),
            "AttendanceRecordListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/gp/attendance/components/AttendanceRecordFormClient"),
            "AttendanceRecordFormClient",
        ),
    }),
    customWorkspaceRoute({
        id: "attendance-requests",
        href: "/attendance/requests",
        label: "Solicitações de ajuste",
        icon: ClipboardCheck,
        permission: "attendance:read",
        load: () => import("@/modules/gp/attendance/components/AttendanceRequestsPage"),
    }),
    customWorkspaceRoute({
        id: "hour-bank",
        href: "/attendance/hour-bank",
        label: "Banco de horas",
        icon: Hourglass,
        permission: "hourbank:read",
        load: () => import("@/modules/gp/hourbank/components/HourBankPage"),
    }),
    customWorkspaceRoute({
        id: "timesheets",
        href: "/attendance/timesheets",
        label: "Espelho de ponto",
        icon: FileClock,
        permission: "timesheet:read",
        load: () => import("@/modules/gp/timesheet/components/TimesheetPage"),
    }),
    customWorkspaceRoute({
        id: "absence-calendar",
        href: "/attendance/calendar",
        label: "Agenda de ausências",
        icon: CalendarDays,
        permission: "attendance:read",
        load: () => import("@/modules/gp/calendar/components/AbsenceCalendarPage"),
    }),
];
