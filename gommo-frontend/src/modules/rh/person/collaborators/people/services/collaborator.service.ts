import type {
    Collaborator,
    CollaboratorCreateDto,
} from "@/modules/rh/person/collaborators/people/dto/collaborator.dto";
import { BaseService } from "@/modules/root/services/base.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import { apiFetch } from "@/shared/lib/api.client";
import { maskCpf } from "@/shared/lib/input/cpf";
import { digitsOnly } from "@/shared/lib/input/digits";

const AUTOCOMPLETE_PAGE_SIZE = 6;

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
        const all = await this.getAdmitted();
        const q = query.trim().toLowerCase();
        const digits = digitsOnly(query);
        const filtered = q
            ? all.filter(
                  (p) =>
                      p.fullName.toLowerCase().includes(q) ||
                      (digits && p.cpf.includes(digits)) ||
                      p.socialName?.toLowerCase().includes(q),
              )
            : all;
        const start = page * AUTOCOMPLETE_PAGE_SIZE;
        const slice = filtered.slice(start, start + AUTOCOMPLETE_PAGE_SIZE);
        const items: SelectItem[] = slice.map((p) => ({
            value: p.id,
            label: p.fullName,
            description: maskCpf(p.cpf),
        }));
        const totalPages = Math.max(1, Math.ceil(filtered.length / AUTOCOMPLETE_PAGE_SIZE));
        return {
            items,
            page,
            hasMore: page + 1 < totalPages,
        };
    }
}

export const collaboratorService = new CollaboratorService();
