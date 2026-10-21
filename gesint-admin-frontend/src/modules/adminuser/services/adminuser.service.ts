import type { AdminUser, AdminUserCreateDto } from "@/modules/adminuser/dto/adminuser.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class AdminUserService extends BaseService<AdminUser, AdminUserCreateDto, AdminUserCreateDto> {
    constructor() {
        super("/api/v1/admin-users");
    }

    resetAccess(id: string): Promise<AdminUser> {
        return apiFetch<AdminUser>(`${this.basePath}/${id}/reset-access`, { method: "POST" });
    }
}

export const adminUserService = new AdminUserService();
