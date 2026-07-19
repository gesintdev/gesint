import type { Client, ClientCreateDto } from "@/modules/client/dto/client.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function slugFromName(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
}

export function emptyClientForm(): ClientCreateDto {
    return {
        name: "",
        legalName: "",
        slug: "",
        document: "",
        address: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
    };
}

export function clientToFormDto(client: Client): ClientCreateDto {
    return {
        name: client.name,
        legalName: client.legalName ?? "",
        slug: client.slug,
        document: client.document ? digitsOnly(client.document) : "",
        address: client.address ?? "",
        contactEmail: client.contactEmail ?? "",
        contactPhone: client.contactPhone ?? "",
        notes: client.notes ?? "",
    };
}

export function statusLabel(status?: string): string {
    switch (status) {
        case "ACTIVE":
            return "Ativo";
        case "INACTIVE":
            return "Inativo";
        case "DELETED":
            return "Excluído";
        default:
            return status ?? "—";
    }
}
