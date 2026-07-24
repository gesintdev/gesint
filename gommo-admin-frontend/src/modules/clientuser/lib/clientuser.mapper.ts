import type { ClientUser, ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";

export function emptyClientUserForm(): ClientUserCreateDto {
    return { clientId: "", username: "", email: "", displayName: "" };
}

export function clientUserToFormDto(row: ClientUser): ClientUserCreateDto {
    return {
        clientId: row.clientId,
        username: row.username ?? "",
        email: row.email ?? "",
        displayName: row.displayName ?? "",
    };
}

export function toClientUserSavePayload(form: ClientUserCreateDto): ClientUserCreateDto {
    return {
        clientId: form.clientId,
        username: form.username.trim(),
        email: form.email.trim(),
        displayName: form.displayName?.trim() || undefined,
    };
}

export function validateClientUserForm(form: ClientUserCreateDto): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.username.trim()) errors.username = "Informe o usuário.";
    if (!form.email.trim()) errors.email = "Informe o e-mail.";
    return errors;
}
