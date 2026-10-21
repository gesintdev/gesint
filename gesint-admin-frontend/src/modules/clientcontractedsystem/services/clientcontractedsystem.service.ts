import type {
    ClientContractedSystem,
    ClientContractedSystemCreateDto,
} from "@/modules/clientcontractedsystem/dto/clientcontractedsystem.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ClientContractedSystemService extends BaseService<
    ClientContractedSystem,
    ClientContractedSystemCreateDto,
    ClientContractedSystemCreateDto
> {
    constructor() {
        super("/api/v1/client-contracted-systems");
    }

    getByClientId(clientId: string): Promise<ClientContractedSystem[]> {
        return apiFetch<ClientContractedSystem[]>(`${this.basePath}/by-client/${clientId}`);
    }
}

export const clientContractedSystemService = new ClientContractedSystemService();
