export type SystemScope = "DP" | "RH";

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
    status?: string;
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
