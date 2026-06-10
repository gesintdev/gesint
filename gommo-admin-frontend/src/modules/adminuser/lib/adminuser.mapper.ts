import type { AdminUser, AdminUserCreateDto } from "@/modules/adminuser/dto/adminuser.dto";

export const ADMIN_USER_PASSWORD_MIN_LENGTH = 8;

export function emptyAdminUserForm(): AdminUserCreateDto {
    return { username: "", email: "", fullName: "", password: "" };
}

export function adminUserToFormDto(user: AdminUser): AdminUserCreateDto {
    return { username: user.username, email: user.email, fullName: user.fullName, password: "" };
}

export function toAdminUserSavePayload(form: AdminUserCreateDto, isEditing: boolean): AdminUserCreateDto {
    const payload: AdminUserCreateDto = {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
    };
    const password = form.password?.trim() ?? "";
    if (!isEditing || password) {
        payload.password = password;
    }
    return payload;
}

export function validateAdminUserForm(form: AdminUserCreateDto, isEditing: boolean): string | null {
    if (!form.fullName.trim()) return "Informe o nome completo.";
    if (!form.username.trim()) return "Informe o usuário.";
    if (!form.email.trim()) return "Informe o e-mail.";
    const password = form.password?.trim() ?? "";
    if (!isEditing && !password) return "Informe a senha.";
    if (password && password.length < ADMIN_USER_PASSWORD_MIN_LENGTH) {
        return `A senha deve ter no mínimo ${ADMIN_USER_PASSWORD_MIN_LENGTH} caracteres.`;
    }
    return null;
}
