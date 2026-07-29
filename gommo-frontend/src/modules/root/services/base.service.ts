import type {PageableResponseDto} from "@/shared/dto/pageable.dto";
import {apiFetch} from "@/shared/lib/api.client";

export type EntityStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type GetAllOptions = {
    status?: "ACTIVE" | "INACTIVE";
};

export abstract class BaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
    constructor(protected readonly basePath: string) {
    }

    getAll(options: GetAllOptions = {}): Promise<T[]> {
        const status = options.status ?? "ACTIVE";
        const params = new URLSearchParams({status});
        return apiFetch<T[]>(`${this.basePath}?${params.toString()}`);
    }

    getById(id: string): Promise<T> {
        return apiFetch<T>(`${this.basePath}/${id}`);
    }

    create(dto: CreateDto): Promise<T> {
        return apiFetch<T>(this.basePath, {method: "POST", body: dto});
    }

    update(id: string, dto: UpdateDto): Promise<T> {
        return apiFetch<T>(`${this.basePath}/${id}`, {method: "PUT", body: dto});
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

    getPage(page = 0, size = 20, filters: Record<string, string[]> = {}): Promise<PageableResponseDto<T>> {
        const params = new URLSearchParams({page: String(page), size: String(size)});
        Object.entries(filters).forEach(([field, values]) => {
            values.forEach((value) => {
                if (value) params.append(`filter.${field}`, value);
            });
        });
        return apiFetch<PageableResponseDto<T>>(`${this.basePath}/page?${params.toString()}`);
    }
}
