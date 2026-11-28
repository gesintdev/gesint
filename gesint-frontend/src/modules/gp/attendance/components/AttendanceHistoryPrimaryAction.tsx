"use client";

import {Plus} from "lucide-react";

import {clearAttendanceCollaboratorFocus} from "@/modules/gp/attendance/lib/attendance-collaborator-focus";
import {useHasPermission} from "@/shared/auth/permissions";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";

/**
 * "+ Histórico de ponto" da listagem: abre o histórico limpo, sem o colaborador da última linha aberta.
 * Abrir pela linha (ou por outra tela) continua levando o colaborador via foco.
 */
export function AttendanceHistoryPrimaryAction() {
    const {startCreate} = useCrudScreen();
    const canWrite = useHasPermission("attendance:write");
    if (!canWrite) return null;

    return (
        <Button
            leftIcon={<Plus className="size-4" strokeWidth={2}/>}
            onClick={() => {
                clearAttendanceCollaboratorFocus();
                void startCreate();
            }}
        >
            Histórico de ponto
        </Button>
    );
}
