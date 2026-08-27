import type { ClientBranch, ClientBranchCreateDto } from "@/modules/clientbranch/dto/clientbranch.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ClientBranchService extends BaseService<ClientBranch, ClientBranchCreateDto, ClientBranchCreateDto> {
    constructor() {
        super("/api/v1/client-branches");
    }

    getByClientId(clientId: string): Promise<ClientBranch[]> {
        return apiFetch<ClientBranch[]>(`${this.basePath}?clientId=${encodeURIComponent(clientId)}`);
    }

    /** Reaplica o seed das filiais como company no schema do tenant. */
    syncToTenant(clientId: string): Promise<ClientBranch[]> {
        return apiFetch<ClientBranch[]>(
            `${this.basePath}/actions/sync-to-tenant?clientId=${encodeURIComponent(clientId)}`,
            { method: "POST" },
        );
    }
}

export const clientBranchService = new ClientBranchService();
