import type {SystemScope} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";

/** Perfis atribuidos ao usuario em cada filial, por sistema: filial -> sistema -> perfis. */
export type RolesByBranch = Record<string, Partial<Record<SystemScope, Profile[]>>>;

/** Ids de perfis por filial e sistema enviados no cadastro do usuario. */
export type RoleIdsByBranch = Record<string, Partial<Record<SystemScope, string[]>>>;

export type AppUser = {
    id: string;
    code?: number;
    status?: string;
    collaboratorId: string;
    collaboratorName?: string | null;
    username: string;
    email: string;
    rolesByBranch?: RolesByBranch;
    lastLogin?: string | null;
    firstAccessCompleted?: boolean;
    /** Presente apenas após create/reset-access. */
    accessToken?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type AppUserCreateDto = {
    collaboratorId: string;
    username: string;
    email: string;
    roleIdsByBranch?: RoleIdsByBranch;
};
