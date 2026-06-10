import type { Collaborator } from "@/modules/person/collaborators/people/dto/collaborator.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function suggestUsernameFromCollaborator(collaborator: Collaborator): string {
    const email = collaborator.email?.trim();
    if (email?.includes("@")) {
        const localPart = email.split("@")[0]?.trim().toLowerCase() ?? "";
        const normalized = localPart.replace(/[^a-z0-9._-]/g, "");
        if (normalized) return normalized;
    }
    const cpf = digitsOnly(collaborator.cpf);
    if (cpf.length >= 11) return cpf;
    return collaborator.fullName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ".")
        .replace(/[^a-z0-9._-]/g, "");
}

export function suggestEmailFromCollaborator(collaborator: Collaborator): string {
    return collaborator.email?.trim().toLowerCase() ?? "";
}
