import type { Department, DepartmentCreateDto } from "@/modules/department/dto/department.dto";
import { BaseService } from "@/modules/root/services/base.service";
class DepartmentService extends BaseService<Department, DepartmentCreateDto, DepartmentCreateDto> {
    constructor() {
        super("/api/v1/departments");
    }
}

export const departmentService = new DepartmentService();
