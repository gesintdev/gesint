import type { PermissionModuleGroup, SystemScope } from "@/modules/settings/profile/dto/profile.dto";
import { apiFetch } from "@/shared/lib/api.client";
class PermissionCatalogService {
    getBySystem(system: SystemScope, module?: string): Promise<PermissionModuleGroup[]> {
        const params = new URLSearchParams({ system });
        if (module) params.set("module", module);
        return apiFetch<PermissionModuleGroup[]>(`/api/v1/permission-catalog?${params.toString()}`);
    }
}

export const permissionCatalogService = new PermissionCatalogService();
