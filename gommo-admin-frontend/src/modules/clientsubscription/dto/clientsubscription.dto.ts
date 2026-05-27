export class ClientSubscription {
    id!: string;
    status!: string;
    clientId!: string;
    planCode!: string;
    billingStatus!: string;
    startedAt?: string;
    endsAt?: string;
    monthlyAmount?: number | string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientSubscriptionCreateDto {
    clientId!: string;
    planCode!: string;
    billingStatus!: string;
    startedAt?: string;
    endsAt?: string;
    monthlyAmount?: string;
    notes?: string;
}
