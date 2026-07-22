import type {SystemScope} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";

export type AppUser = {
    id: string;
    code?: number;
    status?: string;
    collaboratorId: string;
    collaboratorName?: string | null;
    username: string;
    email: string;
    rolesBySystem?: Partial<Record<SystemScope, Profile[]>>;
    /** Rótulo agregado para grid (preenchido no service). */
    rolesLabel?: string;
    lastLogin?: string | null;
    mustChangePwd?: boolean;
    /** Presente apenas após create/reset-password. */
    temporaryPassword?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type AppUserCreateDto = {
    collaboratorId: string;
    username: string;
    email: string;
    roleIdsBySystem?: Partial<Record<SystemScope, string[]>>;
};
