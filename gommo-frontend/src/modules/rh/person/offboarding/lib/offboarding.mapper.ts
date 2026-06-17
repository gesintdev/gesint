import type { Offboarding, OffboardingCreateDto } from "@/modules/rh/person/offboarding/dto/offboarding.dto";

export function offboardingToFormDto(entity: Offboarding): OffboardingCreateDto {
    return {
        collaboratorId: entity.collaboratorId,
        dismissalDate: entity.dismissalDate?.slice(0, 10) ?? "",
        dismissalType: entity.dismissalType,
        dismissalNotes: entity.dismissalNotes,
        homologationNotes: entity.homologationNotes,
    };
}

export const emptyOffboardingForm = (): OffboardingCreateDto => ({
    collaboratorId: "",
    dismissalDate: "",
});
