import type {
    ClientSubscription,
    ClientSubscriptionCreateDto,
} from "@/modules/clientsubscription/dto/clientsubscription.dto";
import { BaseService } from "@/modules/root/services/base.service";
class ClientSubscriptionService extends BaseService<
    ClientSubscription,
    ClientSubscriptionCreateDto,
    ClientSubscriptionCreateDto
> {
    constructor() {
        super("/api/v1/client-subscriptions");
    }
}

export const clientSubscriptionService = new ClientSubscriptionService();
