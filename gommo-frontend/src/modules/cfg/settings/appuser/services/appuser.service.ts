import type {AppUser, AppUserCreateDto} from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    systemScopeShortLabel,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {BaseService} from "@/modules/root/services/base.service";
import {apiFetch} from "@/shared/lib/api.client";

function formatRolesBySystem(rolesBySystem?: Partial<Record<SystemScope, Profile[]>>): string {
    const parts: string[] = [];
    for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
        const profiles = rolesBySystem?.[scope];
        if (!profiles?.length) continue;
        parts.push(`${systemScopeShortLabel(scope)}: ${profiles.map((profile) => profile.name).join(", ")}`);
    }
    return parts.length ? parts.join(" · ") : "—";
}

function enrichAppUser(user: AppUser): AppUser {
    return {
        ...user,
        rolesLabel: formatRolesBySystem(user.rolesBySystem),
    };
}

class AppUserService extends BaseService<AppUser, AppUserCreateDto, AppUserCreateDto> {
    constructor() {
        super("/api/v1/app-users");
    }

    override async getAll(): Promise<AppUser[]> {
        const rows = await super.getAll();
        return rows.map(enrichAppUser);
    }

    override async getById(id: string): Promise<AppUser> {
        const user = await super.getById(id);
        return enrichAppUser(user);
    }

    resetPassword(id: string): Promise<AppUser> {
        return apiFetch<AppUser>(`${this.basePath}/${id}/reset-password`, {method: "POST"});
    }
}

export const appUserService = new AppUserService();
