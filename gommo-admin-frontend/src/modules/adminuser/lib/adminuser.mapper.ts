import type {AdminUser, AdminUserCreateDto} from "@/modules/adminuser/dto/adminuser.dto";

export function emptyAdminUserForm(): AdminUserCreateDto {
    return {username: "", email: "", fullName: "", password: ""};
}

export function adminUserToFormDto(user: AdminUser): AdminUserCreateDto {
    return {username: user.username, email: user.email, fullName: user.fullName, password: ""};
}
