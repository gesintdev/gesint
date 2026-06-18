import type { VacationEligibleCollaborator } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";

export type { VacationEligibleCollaborator };

export function loadVacationEligibleCollaborators(): Promise<VacationEligibleCollaborator[]> {
    return leaverequestService.getVacationEligibleCollaborators();
}
