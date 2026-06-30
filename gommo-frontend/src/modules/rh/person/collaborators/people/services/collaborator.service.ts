import { COLLABORATOR_TABLE_COLUMNS } from "@/modules/rh/person/collaborators/people/config/people.table-columns";
import type {
    Collaborator,
    CollaboratorCreateDto,
} from "@/modules/rh/person/collaborators/people/dto/collaborator.dto";
import { BaseService } from "@/modules/root/services/base.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { apiFetch } from "@/shared/lib/api.client";
import { maskCpf } from "@/shared/lib/input/cpf";
import { digitsOnly } from "@/shared/lib/input/digits";
import type { EntityPickerAdvancedSearch, EntityPickerSearchParams } from "@/shared/types/entity-picker.types";

const AUTOCOMPLETE_PAGE_SIZE = 6;
const MODAL_PAGE_SIZE = 10;

type CollaboratorSearchParams = {
    page: number;
    size: number;
    fullName?: string;
    cpf?: string;
};

class CollaboratorService extends BaseService<Collaborator, CollaboratorCreateDto, CollaboratorCreateDto> {
    constructor() {
        super("/api/v1/collaborators");
    }
    /** Colaboradores criados ao concluir admissão (única origem válida de cadastro). */
    getAdmitted(): Promise<Collaborator[]> {
        return apiFetch<Collaborator[]>(`${this.basePath}/admitted`);
    }
    /** Busca paginada para autocomplete (máx. 6 por página). */
    async searchForAutocomplete(query: string, page = 0): Promise<SelectSearchResult> {
        const result = await this.searchAdmitted({ page, size: AUTOCOMPLETE_PAGE_SIZE, fullName: query, cpf: query });
        return {
            items: result.content.map(toCollaboratorSelectItem),
            page,
            hasMore: page + 1 < result.totalPages,
        };
    }
    async searchAdmitted(params: CollaboratorSearchParams): Promise<PageableResponseDto<Collaborator>> {
        const all = await this.getAdmitted();
        const name = params.fullName?.trim().toLowerCase() ?? "";
        const cpfDigits = digitsOnly(params.cpf ?? "");
        const filtered = all.filter((p) => {
            const matchesName = name
                ? p.fullName.toLowerCase().includes(name) || p.socialName?.toLowerCase().includes(name)
                : true;
            const matchesCpf = cpfDigits ? p.cpf.includes(cpfDigits) : true;
            return matchesName && matchesCpf;
        });
        const start = params.page * params.size;
        const content = filtered.slice(start, start + params.size);
        return {
            content,
            page: params.page,
            size: params.size,
            totalElements: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / params.size)),
        };
    }
    searchForPicker(params: EntityPickerSearchParams): Promise<PageableResponseDto<Collaborator>> {
        return this.searchAdmitted({
            page: params.page,
            size: params.size,
            fullName: params.filters.fullName,
            cpf: params.filters.cpf,
        });
    }
}

export function toCollaboratorSelectItem(collaborator: Collaborator): SelectItem {
    return {
        value: collaborator.id,
        label: collaborator.fullName,
        description: maskCpf(collaborator.cpf),
    };
}

export const collaboratorService = new CollaboratorService();
export const COLLABORATOR_PICKER_ADVANCED: EntityPickerAdvancedSearch<Collaborator> = {
    title: "Buscar colaborador",
    filters: [
        { id: "fullName", label: "Nome", placeholder: "Ex.: Maria Silva" },
        { id: "cpf", label: "CPF", placeholder: "Ex.: 123.456.789-00" },
    ],
    columns: COLLABORATOR_TABLE_COLUMNS,
    search: (params) => collaboratorService.searchForPicker(params),
    toSelectItem: toCollaboratorSelectItem,
    pageSize: MODAL_PAGE_SIZE,
    emptyMessage: "Nenhum colaborador encontrado.",
};