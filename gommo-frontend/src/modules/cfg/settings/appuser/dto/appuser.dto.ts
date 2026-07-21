import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";

export type AppUser = {
    id: string;
    code?: number;
    status?: string;
    collaboratorId: string;
    collaboratorName?: string | null;
    username: string;
    email: string;
    dpRoles?: Profile[];
    rhRoles?: Profile[];
    /** Rótulos para grid (preenchido no service). */
    dpRolesLabel?: string;
    rhRolesLabel?: string;
    lastLogin?: string | null;
    mustChangePwd?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type AppUserCreateDto = {
    collaboratorId: string;
    username: string;
    email: string;
    password?: string;
    dpRoleIds?: string[];
    rhRoleIds?: string[];
};
