import type { ClientUser, ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";

export const CLIENT_USER_PASSWORD_MIN_LENGTH = 8;

export function emptyClientUserForm(): ClientUserCreateDto {
    return { clientId: "", username: "", email: "", displayName: "", password: "" };
}

export function clientUserToFormDto(row: ClientUser): ClientUserCreateDto {
    return {
        clientId: row.clientId,
        username: row.username ?? "",
        email: row.email ?? "",
        displayName: row.displayName ?? "",
        password: "",
    };
}

export function toClientUserSavePayload(form: ClientUserCreateDto, isEditing: boolean): ClientUserCreateDto {
    const payload: ClientUserCreateDto = {
        clientId: form.clientId.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        displayName: form.displayName?.trim() || undefined,
    };
    const password = form.password?.trim() ?? "";
    if (!isEditing || password) {
        payload.password = password;
    }
    return payload;
}

export function validateClientUserForm(form: ClientUserCreateDto, isEditing: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.clientId.trim()) errors.clientId = "Selecione o cliente.";
    if (!form.username.trim()) errors.username = "Informe o usuário.";
    if (!form.email.trim()) errors.email = "Informe o e-mail.";
    const password = form.password?.trim() ?? "";
    if (!isEditing && !password) errors.password = "Informe a senha.";
    if (password && password.length < CLIENT_USER_PASSWORD_MIN_LENGTH) {
        errors.password = `A senha deve ter no mínimo ${CLIENT_USER_PASSWORD_MIN_LENGTH} caracteres.`;
    }
    return errors;
}
