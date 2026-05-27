export const clientSubscriptionKeys = {
    all: ["client-subscriptions"] as const,
    detail: (id: string) => ["client-subscriptions", id] as const,
};
