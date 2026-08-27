import type { SystemScope } from "@/modules/cfg/settings/lib/access-menu-catalog";

export type { SystemScope };
export type ProfileStatus = "ACTIVE" | "INACTIVE" | "DELETED";

/**
 * GLOBAL_ADMIN e INTERNAL nao sao retornados pela API de perfis.
 * ADMIN e o administrador padrao de um sistema, criado no provisionamento e nao editavel.
 */
export type ProfileRoleType = "GLOBAL_ADMIN" | "ADMIN" | "INTERNAL" | "CUSTOM";

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
    roleType?: ProfileRoleType;
    editable?: boolean;
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
