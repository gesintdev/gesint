import type { ClientUser, ClientUserCreateDto } from "@/modules/clientuser/dto/clientuser.dto";

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
