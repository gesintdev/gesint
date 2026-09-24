import type {SystemScope} from "@/modules/cfg/settings/lib/access-menu-catalog";

export type {SystemScope};

export type ActingProfileStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type DataScope = "ALL" | "DEPARTMENT" | "TEAM" | "ASSIGNED" | "SELF";

export type ActingProfile = {
    id: string;
    code?: number;
    name: string;
    description?: string | null;
    system: SystemScope;
    dataScope: DataScope;
    scopeRef?: string | null;
    status?: ActingProfileStatus;
    createdAt?: string;
    updatedAt?: string;
};

export type ActingProfileCreateDto = {
    name: string;
    description?: string;
    system: SystemScope;
    dataScope: DataScope;
    scopeRef?: string | null;
};
