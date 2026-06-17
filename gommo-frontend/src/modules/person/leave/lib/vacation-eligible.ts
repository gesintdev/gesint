import type { Collaborator } from "@/modules/person/collaborators/people/dto/collaborator.dto";
import { collaboratorService } from "@/modules/person/collaborators/people/services/collaborator.service";
import type { LeaveRequest } from "@/modules/person/leave/dto/leave-request.dto";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { loadCollaboratorVacationContext } from "@/modules/person/vacation/lib/collaborator-vacation-context";
import type { VacationPeriodStatus } from "@/modules/person/vacation/types/vacation.types";

export type VacationEligibleCollaborator = {
    collaboratorId: string;
    collaboratorName: string;
    hireDate: string | null;
    contractType: string;
    periodStatus: VacationPeriodStatus;
    entitledDays: number;
    unjustifiedAbsences: number;
    justifiedAbsences: number;
    acquisitionStart: string;
    acquisitionEnd: string;
    concessiveEnd: string;
};

function hasBlockingVacationRequest(
    leaves: LeaveRequest[],
    collaboratorId: string,
    acquisitionStart: string,
): boolean {
    return leaves.some((row) => {
        if (row.leaveType !== "VACATION" || row.collaboratorId !== collaboratorId) return false;
        if (row.approved === true) return false;
        if (row.reviewStatus === "REJECTED" || row.reviewStatus === "RETURNED") return false;
        const rowStart = row.acquisitionPeriodStart?.slice(0, 10);
        return !rowStart || rowStart === acquisitionStart;
    });
}

function isEligibleStatus(status: VacationPeriodStatus): boolean {
    return status === "AVAILABLE" || status === "CONCESSIVE";
}

export async function loadVacationEligibleCollaborators(): Promise<VacationEligibleCollaborator[]> {
    const [collaborators, leaves] = await Promise.all([
        collaboratorService.getAll(),
        leaverequestService.getAll(),
    ]);
    const active = collaborators.filter((c) => c.status !== "DELETED");
    const results: VacationEligibleCollaborator[] = [];

    for (const collaborator of active) {
        const summary = await buildEligibleRow(collaborator, leaves);
        if (summary) results.push(summary);
    }

    return results.sort((a, b) => a.collaboratorName.localeCompare(b.collaboratorName, "pt-BR"));
}

async function buildEligibleRow(
    collaborator: Collaborator,
    leaves: LeaveRequest[],
): Promise<VacationEligibleCollaborator | null> {
    const context = await loadCollaboratorVacationContext(collaborator.id, 0);
    if (context.contractType !== "CLT" || !context.hireDate || !context.acquisition || !context.concessive) {
        return null;
    }
    if (!isEligibleStatus(context.status) || context.entitledDays <= 0) {
        return null;
    }
    if (hasBlockingVacationRequest(leaves, collaborator.id, context.acquisition.start)) {
        return null;
    }

    let unjustifiedAbsences = 0;
    let justifiedAbsences = 0;
    try {
        const summary = await leaverequestService.absenceSummary(
            collaborator.id,
            context.acquisition.start,
            context.acquisition.end,
        );
        unjustifiedAbsences = summary.unjustifiedAbsences;
        justifiedAbsences = summary.justifiedAbsences;
    } catch {
        unjustifiedAbsences = context.unjustifiedAbsences;
    }

    const refreshed = await loadCollaboratorVacationContext(collaborator.id, unjustifiedAbsences);
    if (!isEligibleStatus(refreshed.status) || refreshed.entitledDays <= 0) {
        return null;
    }

    return {
        collaboratorId: collaborator.id,
        collaboratorName: collaborator.fullName,
        hireDate: context.hireDate,
        contractType: context.contractType,
        periodStatus: refreshed.status,
        entitledDays: refreshed.entitledDays,
        unjustifiedAbsences,
        justifiedAbsences,
        acquisitionStart: context.acquisition.start,
        acquisitionEnd: context.acquisition.end,
        concessiveEnd: context.concessive.end,
    };
}
