import type { AdmissionProcessCreateDto } from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import { isAdmissionPj } from "@/modules/person/collaborators/admission/lib/admission-contract.util";
import { isStepFilled } from "@/shared/lib/form-step.util";

export type AdmissionStepContext = {
    documentCount: number;
    contractDocumentCount: number;
    hasPhoto: boolean;
};

export function isAdmissionStepComplete(
    stepId: string,
    form: AdmissionProcessCreateDto,
    context: AdmissionStepContext,
): boolean {
    switch (stepId) {
        case "dados-basicos":
            return isStepFilled([
                {value: form.fullName},
                {value: form.cpf},
                {value: form.birthDate},
            ]) && context.hasPhoto;
        case "contatos-emergencia":
            return (form.emergencyContacts ?? []).some((contact) =>
                isStepFilled([{ value: contact.name }, { value: contact.phone }]),
            );
        case "endereco":
            return isStepFilled([
                {value: form.zipCode},
                {value: form.stateCode},
                {value: form.street},
                {value: form.number},
                {value: form.city},
            ]);
        case "documentos":
            return context.documentCount > 0;
        case "vinculo":
            if (isAdmissionPj(form.contractType)) {
                return isStepFilled([
                    {value: form.expectedStartDate},
                    {value: form.contractType},
                    {value: form.providerCnpj},
                    {value: form.providerLegalName},
                ]);
            }
            return isStepFilled([
                {value: form.expectedStartDate},
                {value: form.contractType},
                {value: form.workloadSchedule},
            ]);
        case "contrato":
            return isStepFilled([{value: form.contractStartDate}]) && context.contractDocumentCount > 0;
        case "observacoes":
            return isStepFilled([{value: form.notes}]);
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

export function computeAdmissionStatus(
    form: AdmissionProcessCreateDto,
    context: AdmissionStepContext,
    stepIds: string[],
): "IN_PROGRESS" | "COMPLETED" {
    const requiredSteps = stepIds.filter((id) => id !== "observacoes");
    const allComplete = requiredSteps.every((stepId) => isAdmissionStepComplete(stepId, form, context));
    return allComplete ? "COMPLETED" : "IN_PROGRESS";
}
