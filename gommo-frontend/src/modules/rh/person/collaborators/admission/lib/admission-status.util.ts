import type { AdmissionProcessCreateDto } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { isAdmissionPj } from "@/modules/rh/person/collaborators/admission/lib/admission-contract.util";
import { isStepFilled } from "@/shared/lib/form-step.util";

export type AdmissionStepContext = {
    documentCount: number;
    contractDocumentCount: number;
};

export function isAdmissionStepComplete(
    stepId: string,
    form: AdmissionProcessCreateDto,
    context: AdmissionStepContext,
): boolean {
    switch (stepId) {
        case "dados-basicos":
            if (isAdmissionPj(form.contractType)) {
                return isStepFilled([
                    { value: form.contractType },
                    { value: form.providerCnpj },
                    { value: form.providerLegalName },
                    { value: form.fullName },
                    { value: form.cpf },
                    { value: form.birthDate },
                ]);
            }
            return isStepFilled([
                { value: form.contractType },
                { value: form.fullName },
                { value: form.cpf },
                { value: form.birthDate },
            ]);
        case "contatos-emergencia":
            return (form.emergencyContacts ?? []).some((contact) =>
                isStepFilled([{ value: contact.name }, { value: contact.phone }]),
            );
        case "endereco":
            return isStepFilled([
                { value: form.zipCode },
                { value: form.stateId },
                { value: form.street },
                { value: form.number },
                { value: form.cityId },
            ]);
        case "documentos":
            return context.documentCount > 0;
        case "vinculo":
            if (isAdmissionPj(form.contractType)) {
                return isStepFilled([{ value: form.expectedStartDate }]);
            }
            return isStepFilled([{ value: form.expectedStartDate }, { value: form.workloadSchedule }]);
        case "contrato":
            return isStepFilled([{ value: form.contractStartDate }]) && context.contractDocumentCount > 0;
        case "recesso-contratual":
            if (!isAdmissionPj(form.contractType) || !form.recessEnabled) return true;
            return isStepFilled([
                { value: form.recessTotalDaysPerCycle },
                { value: form.recessCycleMonths },
                { value: form.recessEligibilityAfterMonths },
                { value: form.recessFinancialMode },
                { value: form.recessAdvanceNoticeDays },
            ]);
        case "observacoes":
            return isStepFilled([{ value: form.notes }]);
        default:
            return false;
    }
}

export function computeFilledAdmissionSteps(
    form: AdmissionProcessCreateDto,
    context: AdmissionStepContext,
    stepIds: string[],
): string[] {
    return stepIds.filter((stepId) => stepId !== "observacoes" && isAdmissionStepComplete(stepId, form, context));
}
