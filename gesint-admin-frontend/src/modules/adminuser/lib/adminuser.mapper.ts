import type { AdminUser, AdminUserCreateDto } from "@/modules/adminuser/dto/adminuser.dto";

export function emptyAdminUserForm(): AdminUserCreateDto {
    return { username: "", email: "", fullName: "" };
}

export function adminUserToFormDto(user: AdminUser): AdminUserCreateDto {
    return { username: user.username, email: user.email, fullName: user.fullName };
}

export function toAdminUserSavePayload(form: AdminUserCreateDto): AdminUserCreateDto {
    return {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
    };
}

export function validateAdminUserForm(form: AdminUserCreateDto): string | null {
    if (!form.fullName.trim()) return "Informe o nome completo.";
    if (!form.username.trim()) return "Informe o usuário.";
    if (!form.email.trim()) return "Informe o e-mail.";
    return null;
}
