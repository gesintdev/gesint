import type { Client, ClientCreateDto } from "@/modules/client/dto/client.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function tenantSchemaFromSlug(slug: string): string {
    const normalized = slug.trim().toLowerCase().replace(/-/g, "_");
    return normalized ? `tenant_${normalized}` : "public";
}

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
        databaseStrategy: "DEDICATED_SCHEMA",
        databaseHost: "",
        databasePort: 5432,
        databaseName: "",
        databaseSchema: "",
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
        document: client.document ? digitsOnly(client.document) : "",
        contactEmail: client.contactEmail ?? "",
        contactPhone: client.contactPhone ?? "",
        notes: client.notes ?? "",
        routingMode: client.routingMode ?? "SUBDOMAIN",
        subdomain: client.subdomain ?? "",
        customDomain: client.customDomain ?? "",
        databaseStrategy: client.databaseStrategy ?? "DEDICATED_SCHEMA",
        databaseHost: client.databaseHost ?? "",
        databasePort: client.databasePort ?? 5432,
        databaseName: client.databaseName ?? "",
        databaseSchema: client.databaseSchema ?? tenantSchemaFromSlug(client.slug),
        databaseUser: client.databaseUser ?? "",
        databaseSecretRef: client.databaseSecretRef ?? "",
        provisioningStatus: client.provisioningStatus ?? "PENDING",
        provisioningNotes: client.provisioningNotes ?? "",
    };
}
