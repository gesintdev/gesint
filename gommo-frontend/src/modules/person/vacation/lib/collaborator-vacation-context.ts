import type { EmploymentContract } from "@/modules/person/contract/dto/employment-contract.dto";
import { employmentcontractService } from "@/modules/person/contract/services/employment-contract.service";
import type { VacationPeriodContext } from "@/modules/person/vacation/types/vacation.types";
import {
    acquisitionPeriod,
    concessivePeriod,
    resolvePeriodStatus,
    vacationDaysEntitled,
} from "@/modules/person/vacation/lib/vacation-rules";

function activeContract(contracts: EmploymentContract[], collaboratorId: string): EmploymentContract | null {
    const mine = contracts
        .filter((c) => c.collaboratorId === collaboratorId && c.status !== "DELETED")
        .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
    return mine[0] ?? null;
}

export async function loadCollaboratorVacationContext(
    collaboratorId: string,
    unjustifiedAbsences: number,
    periodIndex = 0,
): Promise<VacationPeriodContext> {
    const contracts = await employmentcontractService.getAll();
    const contract = activeContract(contracts, collaboratorId);
    const contractType = contract?.contractType ?? "CLT";
    const hireDate = contract?.startDate?.slice(0, 10) ?? null;
    const baseSalary = contract?.baseSalary != null ? Number(contract.baseSalary) : null;
    const entitledDays = vacationDaysEntitled(unjustifiedAbsences);

    if (!hireDate || contractType !== "CLT") {
        return {
            contractType,
            hireDate,
            baseSalary,
            acquisition: null,
            concessive: null,
            status: contractType === "CLT" ? "ACQUIRING" : "AVAILABLE",
            entitledDays: contractType === "CLT" ? entitledDays : 0,
            unjustifiedAbsences,
        };
    }

    const acquisition = acquisitionPeriod(hireDate, periodIndex);
    const concessive = concessivePeriod(acquisition.end);
    const status = resolvePeriodStatus(acquisition, concessive, entitledDays);

    return {
        contractType,
        hireDate,
        baseSalary,
        acquisition,
        concessive,
        status,
        entitledDays,
        unjustifiedAbsences,
    };
}
