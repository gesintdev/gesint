import type {
    ClientSubscription,
    ClientSubscriptionCreateDto,
} from "@/modules/clientsubscription/dto/clientsubscription.dto";

export function emptyClientSubscriptionForm(): ClientSubscriptionCreateDto {
    return {
        clientId: "",
        planCode: "STARTER",
        billingStatus: "ACTIVE",
        startedAt: "",
        endsAt: "",
        monthlyAmount: undefined,
        notes: "",
    };
}

export function clientSubscriptionToFormDto(item: ClientSubscription): ClientSubscriptionCreateDto {
    return {
        clientId: item.clientId,
        planCode: item.planCode,
        billingStatus: item.billingStatus,
        startedAt: item.startedAt?.slice(0, 10) ?? "",
        endsAt: item.endsAt?.slice(0, 10) ?? "",
        monthlyAmount: item.monthlyAmount != null ? String(item.monthlyAmount) : "",
        notes: item.notes ?? "",
    };
}
