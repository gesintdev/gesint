import type { SystemScope } from "@/modules/cfg/settings/lib/access-menu-catalog";

export type { SystemScope };
export type ProfileStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type PermissionSummary = {
    id: string;
    code?: number;
    authority: string;
    module: string;
    description?: string | null;
};

export type Profile = {
    id: string;
    code?: number;
    name: string;
    description?: string | null;
    system: SystemScope;
    status?: ProfileStatus;
    permissions?: PermissionSummary[];
    createdAt?: string;
    updatedAt?: string;
};

export type ProfileCreateDto = {
    name: string;
    description?: string;
    system: SystemScope;
    permissionIds: string[];
};

export type PermissionModuleGroup = {
    module: string;
    label: string;
    permissions: PermissionSummary[];
};
