import type { ClientUser, ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";
import { BaseService } from "@/modules/root/services/base.service";

class ClientUserService extends BaseService<ClientUser, ClientUserCreateDto, ClientUserCreateDto> {
    constructor() {
        super("/api/v1/client-users");
    }
}

export const clientUserService = new ClientUserService();
