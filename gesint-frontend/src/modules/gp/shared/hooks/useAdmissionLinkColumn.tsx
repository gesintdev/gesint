"use client";

import {useMemo} from "react";

import {CollaboratorAdmissionLinkButton} from "@/modules/gp/shared/components/CollaboratorAdmissionLinkButton";
import {SystemEnum} from "@/modules/root/enum/SystemEnum";
import {
    hasPermission,
    permissionsForSystem,
    useSessionPermissions,
    useSessionSystemPermissions,
} from "@/shared/auth/permissions";
import {useOptionalActiveSystem} from "@/shared/context/ActiveSystemContext";
import type {TableColumnConfig} from "@/shared/types/table.types";

type AdmissionTargetSystem = SystemEnum.DP | SystemEnum.RH;

/** Ordem de preferência: a admissão abre no DP; sem acesso ao DP, no RH. */
const ADMISSION_SYSTEMS: AdmissionTargetSystem[] = [SystemEnum.DP, SystemEnum.RH];
const ADMISSION_READ = "admission:read";

type CollaboratorRow = {
    collaboratorId?: string | null;
    collaboratorName?: string | null;
};

/**
 * Sistema em que o usuário pode abrir a admissão: tem acesso ao sistema (rail) e permissão de
 * admissão no escopo dele. DP primeiro, depois RH; sem nenhum dos dois, `null`.
 */
export function useAdmissionTargetSystem(): AdmissionTargetSystem | null {
    const activeSystem = useOptionalActiveSystem();
    const flatPermissions = useSessionPermissions();
    const systemPermissions = useSessionSystemPermissions();
    const availableSystems = activeSystem?.systems;

    return useMemo(() => {
        const available = new Set((availableSystems ?? []).map((system) => system.id));
        return (
            ADMISSION_SYSTEMS.find(
                (system) =>
                    available.has(system) &&
                    hasPermission(permissionsForSystem(flatPermissions, systemPermissions, system), ADMISSION_READ),
            ) ?? null
        );
    }, [availableSystems, flatPermissions, systemPermissions]);
}

/**
 * Coluna "Admissão" das grids do GP (Controle de ponto, Banco de horas, Espelho de ponto):
 * botão que leva o colaborador à admissão no DP ou no RH. Sem acesso a nenhum dos dois, `null`
 * e a coluna não entra na grid.
 */
export function useAdmissionLinkColumn(): TableColumnConfig | null {
    const targetSystem = useAdmissionTargetSystem();

    return useMemo(() => {
        if (!targetSystem) return null;
        return {
            id: "admissionLink",
            columnName: "Admissão",
            fieldValue: "collaboratorId",
            notFilterable: true,
            className: "w-px whitespace-nowrap",
            headerClassName: "w-px whitespace-nowrap",
            renderCell: (row) => {
                const {collaboratorId, collaboratorName} = row as CollaboratorRow;
                if (!collaboratorId) return null;
                return (
                    <CollaboratorAdmissionLinkButton
                        collaboratorId={collaboratorId}
                        collaboratorName={collaboratorName}
                        targetSystem={targetSystem}
                    />
                );
            },
        };
    }, [targetSystem]);
}
