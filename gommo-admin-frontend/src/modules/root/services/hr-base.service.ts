import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { hrApiFetch } from "@/shared/lib/hr-api.client";

export abstract class HrBaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
    constructor(protected readonly basePath: string) {}
    getAll(): Promise<T[]> {
        return hrApiFetch<T[]>(this.basePath);
    }
    getById(id: string): Promise<T> {
        return hrApiFetch<T>(`${this.basePath}/${id}`);
    }
    create(dto: CreateDto): Promise<T> {
        return hrApiFetch<T>(this.basePath, { method: "POST", body: dto });
    }
    update(id: string, dto: UpdateDto): Promise<T> {
        return hrApiFetch<T>(`${this.basePath}/${id}`, { method: "PUT", body: dto });
    }
    remove(id: string): Promise<void> {
        return hrApiFetch<void>(`${this.basePath}/${id}`, { method: "DELETE" });
    }
    getPage(page = 0, size = 20): Promise<PageableResponseDto<T>> {
        return hrApiFetch<PageableResponseDto<T>>(`${this.basePath}/page?page=${page}&size=${size}`);
    }
}
