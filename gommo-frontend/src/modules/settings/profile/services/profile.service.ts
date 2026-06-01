import type {Profile, ProfileCreateDto, SystemScope} from "@/modules/settings/profile/dto/profile.dto";
import {apiFetch} from "@/shared/lib/api.client";

class ProfileService {
    private readonly basePath = "/api/v1/profiles";

    getAll(system?: SystemScope): Promise<Profile[]> {
        const query = system ? `?system=${system}` : "";
        return apiFetch<Profile[]>(`${this.basePath}${query}`);
    }

    getById(id: string): Promise<Profile> {
        return apiFetch<Profile>(`${this.basePath}/${id}`);
    }

    create(dto: ProfileCreateDto): Promise<Profile> {
        return apiFetch<Profile>(this.basePath, {method: "POST", body: dto});
    }

    update(id: string, dto: ProfileCreateDto): Promise<Profile> {
        return apiFetch<Profile>(`${this.basePath}/${id}`, {method: "PUT", body: dto});
    }

    remove(id: string): Promise<void> {
        return apiFetch<void>(`${this.basePath}/${id}`, {method: "DELETE"});
    }
}

export const profileService = new ProfileService();
