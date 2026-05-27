import type { Client, ClientCreateDto } from "@/modules/client/dto/client.dto";

export function emptyClientForm(): ClientCreateDto {
    return {
        name: "",
        slug: "",
        document: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
        routingMode: "SUBDOMAIN",
        subdomain: "",
        customDomain: "",
        databaseStrategy: "DEDICATED_DATABASE",
        databaseHost: "",
        databasePort: 5432,
        databaseName: "",
        databaseSchema: "public",
        databaseUser: "",
        databaseSecretRef: "",
        provisioningStatus: "PENDING",
        provisioningNotes: "",
    };
}

export function clientToFormDto(client: Client): ClientCreateDto {
    return {
        name: client.name,
        slug: client.slug,
        document: client.document ?? "",
        contactEmail: client.contactEmail ?? "",
        contactPhone: client.contactPhone ?? "",
        notes: client.notes ?? "",
        routingMode: client.routingMode ?? "SUBDOMAIN",
        subdomain: client.subdomain ?? "",
        customDomain: client.customDomain ?? "",
        databaseStrategy: client.databaseStrategy ?? "DEDICATED_DATABASE",
        databaseHost: client.databaseHost ?? "",
        databasePort: client.databasePort ?? 5432,
        databaseName: client.databaseName ?? "",
        databaseSchema: client.databaseSchema ?? "public",
        databaseUser: client.databaseUser ?? "",
        databaseSecretRef: client.databaseSecretRef ?? "",
        provisioningStatus: client.provisioningStatus ?? "PENDING",
        provisioningNotes: client.provisioningNotes ?? "",
    };
}
