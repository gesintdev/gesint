import type { Client, ClientCreateDto } from "@/modules/client/dto/client.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function tenantSchemaFromSlug(slug: string): string {
    const normalized = slug.trim().toLowerCase().replace(/-/g, "_");
    return normalized ? `tenant_${normalized}` : "public";
}

const DEV_DB_DEFAULTS = {
    databaseHost: "localhost",
    databasePort: 5432,
    databaseName: "gommo",
    databaseUser: "gommo",
    databaseSecretRef: "DB_PASSWORD",
} as const;

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
        ...DEV_DB_DEFAULTS,
        databaseSchema: "",
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
        databaseHost: client.databaseHost ?? DEV_DB_DEFAULTS.databaseHost,
        databasePort: client.databasePort ?? DEV_DB_DEFAULTS.databasePort,
        databaseName: client.databaseName ?? DEV_DB_DEFAULTS.databaseName,
        databaseSchema: client.databaseSchema ?? tenantSchemaFromSlug(client.slug),
        databaseUser: client.databaseUser ?? DEV_DB_DEFAULTS.databaseUser,
        databaseSecretRef: client.databaseSecretRef ?? DEV_DB_DEFAULTS.databaseSecretRef,
        provisioningStatus: client.provisioningStatus ?? "PENDING",
        provisioningNotes: client.provisioningNotes ?? "",
    };
}
