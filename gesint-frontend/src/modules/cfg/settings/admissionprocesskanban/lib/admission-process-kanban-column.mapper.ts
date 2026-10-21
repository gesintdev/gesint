import type {
    AdmissionProcessKanbanColumn,
    AdmissionProcessKanbanColumnCreateDto,
} from "@/modules/cfg/settings/admissionprocesskanban/dto/admission-process-kanban-column.dto";

export function admissionProcessKanbanColumnToFormDto(
    entity: AdmissionProcessKanbanColumn,
): AdmissionProcessKanbanColumnCreateDto {
    return {
        columnKey: entity.columnKey ?? "",
        name: entity.name ?? "",
        color: entity.color ?? "",
        displayOrder: entity.displayOrder ?? 0,
        slaEnabled: entity.slaEnabled ?? true,
        slaBusinessDays: entity.slaBusinessDays ?? 5,
        interviewColumn: entity.interviewColumn ?? false,
        columnAction: entity.columnAction ?? "NONE",
    };
}

export const emptyAdmissionProcessKanbanColumnForm = (): AdmissionProcessKanbanColumnCreateDto => ({
    columnKey: "",
    name: "",
    color: "",
    displayOrder: 0,
    slaEnabled: true,
    slaBusinessDays: 5,
    interviewColumn: false,
    columnAction: "NONE",
});

export function keyFromColumnName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);
}
