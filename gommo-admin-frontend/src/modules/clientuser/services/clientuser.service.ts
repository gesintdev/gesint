import type { ClientUser, ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ClientUserService extends BaseService<ClientUser, ClientUserCreateDto, ClientUserCreateDto> {
    constructor() {
        super("/api/v1/client-users");
    }

    getByClientId(clientId: string): Promise<ClientUser[]> {
        return apiFetch<ClientUser[]>(`${this.basePath}?clientId=${encodeURIComponent(clientId)}`);
    }

    resetAccess(id: string): Promise<ClientUser> {
        return apiFetch<ClientUser>(`${this.basePath}/${id}/reset-access`, { method: "POST" });
    }
}

export const clientUserService = new ClientUserService();
