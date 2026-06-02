import type { ContractType } from "@/modules/person/collaborators/admission/dto/admission-process.dto";

export function isAdmissionPj(contractType?: ContractType | string | null): boolean {
    return contractType === "PJ";
}
