"use client";

import {ExternalLink} from "lucide-react";

import {
    type OpenAttendanceHistoryInput,
    useOpenAttendanceHistory,
} from "@/modules/gp/attendance/lib/useOpenAttendanceHistory";
import {useHasPermission} from "@/shared/auth/permissions";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";

type AttendanceHistoryLinkButtonProps = OpenAttendanceHistoryInput & {
    /** Chamado depois de abrir o histórico (ex.: fechar o modal de origem). */
    onOpened?: () => void;
};

/**
 * Ação de linha fora do Controle de ponto (espelho, banco de horas): leva ao Histórico de ponto
 * do colaborador, onde as marcações são corrigidas.
 */
export function AttendanceHistoryLinkButton({onOpened, ...input}: AttendanceHistoryLinkButtonProps) {
    const canEdit = useHasPermission("attendance:write");
    const openAttendanceHistory = useOpenAttendanceHistory();
    if (!canEdit) return null;

    return (
        <TableActionButton
            actionVariant="open"
            aria-label="Ir para o Histórico de ponto"
            title="Ir para o Histórico de ponto"
            leftIcon={<ExternalLink className="size-3.5"/>}
            onClick={(event) => {
                event.stopPropagation();
                openAttendanceHistory(input);
                onOpened?.();
            }}
        />
    );
}
