import type {
    AdmissionProcessKanbanColumn,
    AdmissionProcessKanbanColumnCreateDto,
} from "@/modules/cfg/settings/admissionprocesskanban/dto/admission-process-kanban-column.dto";
import { BaseService } from "@/modules/root/services/base.service";

class AdmissionProcessKanbanColumnService extends BaseService<
    AdmissionProcessKanbanColumn,
    AdmissionProcessKanbanColumnCreateDto,
    AdmissionProcessKanbanColumnCreateDto
> {
    constructor() {
        super("/api/v1/admission-process-kanban-columns");
    }
}

export const admissionProcessKanbanColumnService = new AdmissionProcessKanbanColumnService();
