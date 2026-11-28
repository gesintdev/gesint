"use client";

import {useCallback} from "react";

import {
    requestAttendanceHistoryOpen,
    writeAttendanceCollaboratorFocus,
} from "@/modules/gp/attendance/lib/attendance-collaborator-focus";
import {writeAttendanceListPeriod} from "@/modules/gp/attendance/lib/attendance-period-focus";
import {useWorkspaceLink} from "@/shared/workspace/WorkspaceLink";

export type OpenAttendanceHistoryInput = {
    collaboratorId: string;
    collaboratorName?: string;
    /** Período que o histórico abre; sem ele, vale o último período usado no Controle de ponto. */
    from?: string;
    to?: string;
};

/** Abre Controle de ponto › Histórico de ponto com o colaborador já selecionado. */
export function useOpenAttendanceHistory() {
    const {navigate} = useWorkspaceLink();
    return useCallback(
        ({collaboratorId, collaboratorName, from, to}: OpenAttendanceHistoryInput) => {
            const period = from && to ? {from, to} : undefined;
            if (period) writeAttendanceListPeriod(period);
            writeAttendanceCollaboratorFocus({collaboratorId, collaboratorName});
            // Foca (ou abre) a aba do Controle de ponto; a listagem dela troca para o Histórico.
            navigate("/attendance");
            requestAttendanceHistoryOpen({period});
        },
        [navigate],
    );
}
