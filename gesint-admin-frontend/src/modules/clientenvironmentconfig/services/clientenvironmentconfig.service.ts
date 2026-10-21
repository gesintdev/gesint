import type {
    ClientEnvironmentConfig,
    ClientEnvironmentConfigUpsertDto,
} from "@/modules/clientenvironmentconfig/dto/clientenvironmentconfig.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ClientEnvironmentConfigService extends BaseService<
    ClientEnvironmentConfig,
    ClientEnvironmentConfigUpsertDto,
    ClientEnvironmentConfigUpsertDto
> {
    constructor() {
        super("/api/v1/client-environment-configs");
    }

    getByClientId(clientId: string): Promise<ClientEnvironmentConfig> {
        return apiFetch<ClientEnvironmentConfig>(`${this.basePath}/by-client/${clientId}`);
    }

    upsertByClientId(
        clientId: string,
        dto: ClientEnvironmentConfigUpsertDto,
    ): Promise<ClientEnvironmentConfig> {
        return apiFetch<ClientEnvironmentConfig>(`${this.basePath}/by-client/${clientId}`, {
            method: "PUT",
            body: { ...dto, clientId },
        });
    }
}

export const clientEnvironmentConfigService = new ClientEnvironmentConfigService();
