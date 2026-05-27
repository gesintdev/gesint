import type { Client, ClientCreateDto } from "@/modules/client/dto/client.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

export class TenantDatabaseTestResult {
    success!: boolean;
    message!: string;
    latencyMs?: number;
}

class ClientService extends BaseService<Client, ClientCreateDto, ClientCreateDto> {
    constructor() {
        super("/api/v1/clients");
    }

    testDatabaseConnection(id: string): Promise<TenantDatabaseTestResult> {
        return apiFetch<TenantDatabaseTestResult>(`${this.basePath}/${id}/actions/test-database-connection`, {
            method: "POST",
        });
    }

    startProvisioning(id: string): Promise<Client> {
        return apiFetch<Client>(`${this.basePath}/${id}/actions/start-provisioning`, { method: "POST" });
    }
}

export const clientService = new ClientService();
