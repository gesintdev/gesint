import type { StorageLinkRequest, StorageObject, StorageObjectLink } from "@/modules/storage/dto/storage.dto";
import { apiFetch, doRequest } from "@/shared/lib/api.client";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082";

class StorageService {
    upload(file: File): Promise<StorageObject> {
        const formData = new FormData();
        formData.append("file", file);
        return doRequest<StorageObject>("/api/v1/storage/upload", {
            method: "POST",
            body: formData,
        });
    }
    listLinks(entityType: string, entityId: string): Promise<StorageObjectLink[]> {
        const params = new URLSearchParams({ entityType, entityId });
        return apiFetch<StorageObjectLink[]>(`/api/v1/storage/links?${params}`);
    }
    downloadUrl(id: string): string {
        return `${API_BASE_URL}/api/v1/storage/objects/${id}/download`;
    }
    deleteObject(id: string): Promise<void> {
        return apiFetch<void>(`/api/v1/storage/objects/${id}`, { method: "DELETE" });
    }
    linkObject(request: StorageLinkRequest): Promise<StorageObjectLink> {
        return apiFetch<StorageObjectLink>("/api/v1/storage/links", { method: "POST", body: request });
    }
}

export const storageService = new StorageService();
