import { departmentService } from "@/modules/dp/organization/department/services/department.service";
import { jobpositionService } from "@/modules/dp/organization/jobposition/services/jobposition.service";
import type { AdmissionProcess } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import type { ExitInterviewRelationshipType } from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";

export type CollaboratorExitInterviewContext = {
    collaboratorName?: string;
    relationshipType?: ExitInterviewRelationshipType;
    admissionOrContractStartDate?: string;
    terminationOrContractEndDate?: string;
    departmentId?: string;
    departmentName?: string;
    jobPositionId?: string;
    jobPositionName?: string;
};

function startDateFromAdmission(admission: AdmissionProcess): string | undefined {
    return (admission.contractStartDate ?? admission.expectedStartDate)?.slice(0, 10);
}

function latestCompletedAdmission(admissions: AdmissionProcess[], collaboratorId: string): AdmissionProcess | null {
    const mine = admissions.filter(
        (admission) =>
            admission.collaboratorId === collaboratorId &&
            admission.status !== "DELETED" &&
            admission.admissionStatus === "COMPLETED",
    );
    if (mine.length === 0) return null;
    return mine.sort((a, b) => {
        const dateA = startDateFromAdmission(a) ?? "";
        const dateB = startDateFromAdmission(b) ?? "";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    })[0];
}

export async function loadCollaboratorExitInterviewContext(
    collaboratorId: string,
): Promise<CollaboratorExitInterviewContext> {
    const admissions = await admissionprocessService.getAll();
    const admission = latestCompletedAdmission(admissions, collaboratorId);
    if (!admission) return {};

    const [department, jobPosition] = await Promise.all([
        admission.departmentId ? departmentService.getById(admission.departmentId).catch(() => null) : null,
        admission.jobPositionId ? jobpositionService.getById(admission.jobPositionId).catch(() => null) : null,
    ]);

    return {
        collaboratorName: admission.socialName || admission.fullName,
        relationshipType: admission.contractType === "PJ" ? "PJ" : "CLT",
        admissionOrContractStartDate: startDateFromAdmission(admission),
        terminationOrContractEndDate: admission.contractEndDate?.slice(0, 10),
        departmentId: admission.departmentId ?? jobPosition?.departmentId,
        departmentName: department?.name ?? admission.departmentName,
        jobPositionId: admission.jobPositionId,
        jobPositionName: jobPosition?.title,
    };
}
