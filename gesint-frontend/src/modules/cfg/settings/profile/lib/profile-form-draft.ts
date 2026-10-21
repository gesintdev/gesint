import type {SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";

export const PROFILE_FORM_DRAFT_VERSION = 1 as const;

export type ProfileDraftItem = {
    clientId: string;
    system: SystemScope;
    name: string;
    description: string;
    permissionIds: string[];
    /** Justificativas de permissões sensíveis concedidas nesta sessão de edição. */
    sensitiveJustifications?: Record<string, string>;
    selectedRouteId?: string | null;
};

export type ProfileFormDraftPayload = {
    version: typeof PROFILE_FORM_DRAFT_VERSION;
    activeSystem: SystemScope;
    activeClientId: string | null;
    drafts: ProfileDraftItem[];
    updatedAt: number;
};

function storageKey(tenantSlug: string, username: string, mode: "create" | "edit", editingId?: string | null) {
    const tenant = tenantSlug.trim() || "default";
    const user = username.trim() || "anonymous";
    if (mode === "edit" && editingId) {
        return `gesint:profile-form-draft:v${PROFILE_FORM_DRAFT_VERSION}:${tenant}:${user}:edit:${editingId}`;
    }
    return `gesint:profile-form-draft:v${PROFILE_FORM_DRAFT_VERSION}:${tenant}:${user}:create`;
}

function isDraftItem(value: unknown): value is ProfileDraftItem {
    if (!value || typeof value !== "object") return false;
    const item = value as ProfileDraftItem;
    return (
        typeof item.clientId === "string" &&
        typeof item.system === "string" &&
        typeof item.name === "string" &&
        typeof item.description === "string" &&
        Array.isArray(item.permissionIds)
    );
}

export function createEmptyProfileDraft(system: SystemScope, selectedRouteId?: string | null): ProfileDraftItem {
    const clientId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
        clientId,
        system,
        name: "",
        description: "",
        permissionIds: [],
        sensitiveJustifications: {},
        selectedRouteId: selectedRouteId ?? null,
    };
}

export function readProfileFormDraft(
    tenantSlug: string,
    username: string,
    mode: "create" | "edit",
    editingId?: string | null,
): ProfileFormDraftPayload | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(storageKey(tenantSlug, username, mode, editingId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ProfileFormDraftPayload;
        if (parsed?.version !== PROFILE_FORM_DRAFT_VERSION) return null;
        if (!Array.isArray(parsed.drafts) || !parsed.drafts.every(isDraftItem)) return null;
        if (typeof parsed.activeSystem !== "string") return null;
        return parsed;
    } catch {
        return null;
    }
}

export function writeProfileFormDraft(
    tenantSlug: string,
    username: string,
    mode: "create" | "edit",
    payload: Omit<ProfileFormDraftPayload, "version" | "updatedAt">,
    editingId?: string | null,
): void {
    if (typeof window === "undefined") return;
    const body: ProfileFormDraftPayload = {
        version: PROFILE_FORM_DRAFT_VERSION,
        updatedAt: Date.now(),
        ...payload,
    };
    window.localStorage.setItem(storageKey(tenantSlug, username, mode, editingId), JSON.stringify(body));
}

export function clearProfileFormDraft(
    tenantSlug: string,
    username: string,
    mode: "create" | "edit",
    editingId?: string | null,
): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey(tenantSlug, username, mode, editingId));
}

/** Remove todos os rascunhos de perfil do usuário (fechamento intencional da aba). */
export function clearAllProfileFormDrafts(tenantSlug: string, username: string): void {
    if (typeof window === "undefined") return;
    const tenant = tenantSlug.trim() || "default";
    const user = username.trim() || "anonymous";
    const prefix = `gesint:profile-form-draft:v${PROFILE_FORM_DRAFT_VERSION}:${tenant}:${user}:`;
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index);
        if (key?.startsWith(prefix)) {
            window.localStorage.removeItem(key);
        }
    }
}
