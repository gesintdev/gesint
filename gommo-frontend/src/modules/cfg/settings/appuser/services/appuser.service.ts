import type {AppUser, AppUserCreateDto} from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {BaseService} from "@/modules/root/services/base.service";

function profileNames(profiles?: Profile[]): string {
    if (!profiles?.length) return "—";
    return profiles.map((profile) => profile.name).join(", ");
}

function enrichAppUser(user: AppUser): AppUser {
    return {
        ...user,
        dpRolesLabel: profileNames(user.dpRoles),
        rhRolesLabel: profileNames(user.rhRoles),
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
}

export const appUserService = new AppUserService();
