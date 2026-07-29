import type {AppUser, AppUserCreateDto} from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import {BaseService} from "@/modules/root/services/base.service";
import {apiFetch} from "@/shared/lib/api.client";

class AppUserService extends BaseService<AppUser, AppUserCreateDto, AppUserCreateDto> {
    constructor() {
        super("/api/v1/app-users");
    }

    resetAccess(id: string): Promise<AppUser> {
        return apiFetch<AppUser>(`${this.basePath}/${id}/reset-access`, {method: "POST"});
    }

    reactivate(dto: AppUserCreateDto): Promise<AppUser> {
        return apiFetch<AppUser>(`${this.basePath}/reactivate`, {
            method: "POST",
            body: dto,
        });
    }
}

export const appUserService = new AppUserService();
