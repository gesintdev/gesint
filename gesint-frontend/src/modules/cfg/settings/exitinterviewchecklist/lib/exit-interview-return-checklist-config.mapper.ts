import type {
    ExitInterviewReturnChecklistConfig,
    ExitInterviewReturnChecklistConfigCreateDto,
} from "@/modules/cfg/settings/exitinterviewchecklist/dto/exit-interview-return-checklist-config.dto";

export function exitInterviewReturnChecklistConfigToFormDto(
    entity: ExitInterviewReturnChecklistConfig,
): ExitInterviewReturnChecklistConfigCreateDto {
    return {
        itemKey: entity.itemKey ?? "",
        description: entity.description ?? "",
        displayOrder: entity.displayOrder ?? 0,
    };
}

export const emptyExitInterviewReturnChecklistConfigForm = (): ExitInterviewReturnChecklistConfigCreateDto => ({
    itemKey: "",
    description: "",
    displayOrder: 0,
});

export function keyFromDescription(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);
}
