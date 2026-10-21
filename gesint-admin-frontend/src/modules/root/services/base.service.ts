import type {PageableResponseDto} from "@/shared/dto/pageable.dto";
import {apiFetch} from "@/shared/lib/api.client";

export type GetAllOptions = {
    status?: "ACTIVE" | "INACTIVE";
};

export abstract class BaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
    constructor(protected readonly basePath: string) {}

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

    getPage(page = 0, size = 20): Promise<PageableResponseDto<T>> {
        return apiFetch<PageableResponseDto<T>>(`${this.basePath}/page?page=${page}&size=${size}`);
    }
}
