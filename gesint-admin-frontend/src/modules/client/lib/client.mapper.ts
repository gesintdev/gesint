import type {
    Client,
    ClientContactDto,
    ClientCreateDto,
    ClientFormDto,
} from "@/modules/client/dto/client.dto";
import { digitsOnly } from "@/shared/lib/input/digits";
import { maskSinglePhone } from "@/shared/lib/input/phone";

const PHONE_SEPARATOR = "; ";

export function slugFromName(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
}

export function emptyClientForm(): ClientFormDto {
    return {
        name: "",
        legalName: "",
        slug: "",
        document: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        stateCode: "",
        zipCode: "",
        contactEmail: "",
        phones: "",
        notes: "",
    };
}

export function clientToFormDto(client: Client): ClientFormDto {
    const contacts = client.contacts ?? [];
    const email = contacts.find((item) => item.type === "EMAIL")?.value ?? "";
    const phones = contacts
        .filter((item) => item.type === "PHONE")
        .map((item) => maskSinglePhone(item.value))
        .filter(Boolean);

    return {
        name: client.name,
        legalName: client.legalName ?? "",
        slug: client.slug,
        document: client.document ? digitsOnly(client.document) : "",
        street: client.street ?? "",
        number: client.number ?? "",
        complement: client.complement ?? "",
        district: client.district ?? "",
        city: client.city ?? "",
        stateCode: client.stateCode ?? "",
        zipCode: client.zipCode ? digitsOnly(client.zipCode) : "",
        contactEmail: email,
        phones: phones.join(PHONE_SEPARATOR),
        notes: client.notes ?? "",
    };
}

export function formToCreateDto(form: ClientFormDto, defaultSlugHint: (name: string) => string): ClientCreateDto {
    const name = form.name.trim();
    return {
        name,
        legalName: form.legalName?.trim() || undefined,
        slug: (form.slug.trim() || defaultSlugHint(name)).trim(),
        document: form.document?.trim() || undefined,
        street: form.street?.trim() || undefined,
        number: form.number?.trim() || undefined,
        complement: form.complement?.trim() || undefined,
        district: form.district?.trim() || undefined,
        city: form.city?.trim() || undefined,
        stateCode: form.stateCode?.trim().toUpperCase() || undefined,
        zipCode: form.zipCode?.trim() || undefined,
        contacts: buildContactsPayload(form.contactEmail, form.phones),
        notes: form.notes?.trim() || undefined,
    };
}

export function buildContactsPayload(email?: string, phonesSerialized?: string): ClientContactDto[] {
    const contacts: ClientContactDto[] = [];
    const trimmedEmail = email?.trim();
    if (trimmedEmail) {
        contacts.push({ type: "EMAIL", value: trimmedEmail });
    }
    for (const phone of parsePhoneValues(phonesSerialized)) {
        contacts.push({ type: "PHONE", value: phone });
    }
    return contacts;
}

export function parsePhoneValues(raw?: string | null): string[] {
    if (!raw) return [];
    return raw
        .split(/\r?\n|;/)
        .map((item) => maskSinglePhone(item.trim()))
        .filter(Boolean);
}

export function clientPrimaryEmail(client: Client): string {
    return client.contacts?.find((item) => item.type === "EMAIL")?.value ?? "";
}

export function clientPhonesLabel(client: Client): string {
    const phones = (client.contacts ?? [])
        .filter((item) => item.type === "PHONE")
        .map((item) => maskSinglePhone(item.value))
        .filter(Boolean);
    return phones.join(" / ");
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
