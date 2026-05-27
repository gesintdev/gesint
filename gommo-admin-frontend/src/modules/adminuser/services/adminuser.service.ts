import type { AdminUser, AdminUserCreateDto } from "@/modules/adminuser/dto/adminuser.dto";
import { BaseService } from "@/modules/root/services/base.service";

class AdminUserService extends BaseService<AdminUser, AdminUserCreateDto, AdminUserCreateDto> {
    constructor() {
        super("/api/v1/admin-users");
    }
}

export const adminUserService = new AdminUserService();
