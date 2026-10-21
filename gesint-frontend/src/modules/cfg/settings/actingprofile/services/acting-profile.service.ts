import type {
    ActingProfile,
    ActingProfileCreateDto,
    DataScope,
    SystemScope,
} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {apiFetch} from "@/shared/lib/api.client";

class ActingProfileService {
    private readonly basePath = "/api/v1/acting-profiles";

    getAll(system?: SystemScope, includeInactive = false): Promise<ActingProfile[]> {
        const params = new URLSearchParams();
        if (system) params.set("system", system);
        if (includeInactive) params.set("includeInactive", "true");
        const query = params.size ? `?${params.toString()}` : "";
        return apiFetch<ActingProfile[]>(`${this.basePath}${query}`);
    }

    getById(id: string): Promise<ActingProfile> {
        return apiFetch<ActingProfile>(`${this.basePath}/${id}`);
    }

    create(dto: ActingProfileCreateDto): Promise<ActingProfile> {
        return apiFetch<ActingProfile>(this.basePath, {method: "POST", body: dto});
    }

    update(id: string, dto: ActingProfileCreateDto): Promise<ActingProfile> {
        return apiFetch<ActingProfile>(`${this.basePath}/${id}`, {method: "PUT", body: dto});
    }

    remove(id: string): Promise<void> {
        return apiFetch<void>(`${this.basePath}/${id}`, {method: "DELETE"});
    }

    activate(id: string): Promise<void> {
        return apiFetch<void>(`${this.basePath}/${id}/activate`, {method: "PUT"});
    }

    deactivate(id: string): Promise<void> {
        return apiFetch<void>(`${this.basePath}/${id}/deactivate`, {method: "PUT"});
    }
}

export const actingProfileService = new ActingProfileService();

export const DATA_SCOPE_OPTIONS: {value: DataScope; label: string; hint: string}[] = [
    {value: "ALL", label: "Toda a filial", hint: "Vê todos os registros da filial selecionada."},
    {
        value: "DEPARTMENT",
        label: "Departamento…",
        hint: "Restringe aos registros do departamento informado.",
    },
    {
        value: "TEAM",
        label: "Minha equipe direta",
        hint: "Equipe = colaboradores cujo gestor é o usuário vinculado.",
    },
    {
        value: "ASSIGNED",
        label: "Vagas atribuídas a mim",
        hint: "Restringe a registros atribuídos ao usuário (ex.: vagas).",
    },
    {value: "SELF", label: "Somente o próprio", hint: "Apenas os próprios registros do colaborador."},
];
