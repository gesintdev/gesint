import type { AdmissionProcess } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import type { EmploymentContract } from "@/modules/rh/person/contract/dto/employment-contract.dto";
import { employmentcontractService } from "@/modules/rh/person/contract/services/employment-contract.service";
import {
    acquisitionPeriod,
    concessivePeriod,
    resolveActivePeriodIndex,
    resolvePeriodStatus,
    vacationDaysEntitled,
} from "@/modules/rh/person/vacation/lib/vacation-rules";
import type { ContractType, VacationPeriodContext } from "@/modules/rh/person/vacation/types/vacation.types";

type HireProfile = {
    contractType: ContractType;
    hireDate: string | null;
    baseSalary: number | null;
};

function activeContract(contracts: EmploymentContract[], collaboratorId: string): EmploymentContract | null {
    const mine = contracts
        .filter((c) => c.collaboratorId === collaboratorId && c.status !== "DELETED")
        .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
    return mine[0] ?? null;
}

function hireDateFromAdmission(admission: AdmissionProcess): string | null {
    const raw = admission.contractStartDate ?? admission.expectedStartDate;
    return raw ? raw.slice(0, 10) : null;
}

function completedAdmissionForCollaborator(
    admissions: AdmissionProcess[],
    collaboratorId: string,
): AdmissionProcess | null {
    const mine = admissions.filter(
        (a) => a.collaboratorId === collaboratorId && a.status !== "DELETED" && a.admissionStatus === "COMPLETED",
    );
    if (mine.length === 0) return null;
    return mine.sort((a, b) => {
        const dateA = hireDateFromAdmission(a) ?? "";
        const dateB = hireDateFromAdmission(b) ?? "";
        return dateB.localeCompare(dateA);
    })[0];
}

function resolveHireProfile(contract: EmploymentContract | null, admission: AdmissionProcess | null): HireProfile {
    const contractType = contract?.contractType ?? admission?.contractType ?? ("CLT" as ContractType);
    const hireDate = contract?.startDate?.slice(0, 10) ?? (admission ? hireDateFromAdmission(admission) : null);
    let baseSalary: number | null = null;
    if (contract?.baseSalary != null && contract.baseSalary !== "") {
        baseSalary = Number(contract.baseSalary);
    } else if (admission?.baseSalary != null) {
        baseSalary = Number(admission.baseSalary);
    }
    return { contractType, hireDate, baseSalary };
}

function resolveRequestedPeriodIndex(hireDate: string, acquisitionStart?: string): number {
    const requestedStart = acquisitionStart?.slice(0, 10);
    if (!requestedStart) return resolveActivePeriodIndex(hireDate);
    for (let index = 0; index < 100; index += 1) {
        const period = acquisitionPeriod(hireDate, index);
        if (period.start === requestedStart) return index;
        if (period.start > requestedStart) break;
    }
    return resolveActivePeriodIndex(hireDate);
}

export async function loadCollaboratorVacationContext(
    collaboratorId: string,
    unjustifiedAbsences: number,
    acquisitionStart?: string,
): Promise<VacationPeriodContext> {
    const [contracts, admissions] = await Promise.all([
        employmentcontractService.getAll(),
        admissionprocessService.getAll(),
    ]);
    const contract = activeContract(contracts, collaboratorId);
    const admission = completedAdmissionForCollaborator(admissions, collaboratorId);
    const profile = resolveHireProfile(contract, admission);
    const entitledDays = vacationDaysEntitled(unjustifiedAbsences);
    if (!profile.hireDate || profile.contractType !== "CLT") {
        return {
            contractType: profile.contractType,
            hireDate: profile.hireDate,
            baseSalary: profile.baseSalary,
            acquisition: null,
            concessive: null,
            status: profile.contractType === "CLT" ? "ACQUIRING" : "AVAILABLE",
            entitledDays: profile.contractType === "CLT" ? entitledDays : 0,
            unjustifiedAbsences,
            periodIndex: 0,
        };
    }
    const periodIndex = resolveRequestedPeriodIndex(profile.hireDate, acquisitionStart);
    const acquisition = acquisitionPeriod(profile.hireDate, periodIndex);
    const concessive = concessivePeriod(acquisition.end);
    const status = resolvePeriodStatus(acquisition, concessive, entitledDays);
    return {
        contractType: profile.contractType,
        hireDate: profile.hireDate,
        baseSalary: profile.baseSalary,
        acquisition,
        concessive,
        status,
        entitledDays,
        unjustifiedAbsences,
        periodIndex,
    };
}
