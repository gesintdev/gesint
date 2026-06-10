import type { StorageLinkRequest, StorageObject, StorageObjectLink } from "@/modules/storage/dto/storage.dto";
import { apiFetch, doRequest } from "@/shared/lib/api.client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

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
    async fetchBlobUrl(id: string): Promise<string> {
        const blob = await doRequest<Blob>(`/api/v1/storage/objects/${id}/download`, {
            responseType: "blob",
        });
        return URL.createObjectURL(blob);
    }
    async downloadFile(id: string, filename: string): Promise<void> {
        const blob = await doRequest<Blob>(`/api/v1/storage/objects/${id}/download`, {
            responseType: "blob",
        });
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename || "download";
        anchor.rel = "noopener";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
    deleteObject(id: string): Promise<void> {
        return apiFetch<void>(`/api/v1/storage/objects/${id}`, { method: "DELETE" });
    }
    linkObject(request: StorageLinkRequest): Promise<StorageObjectLink> {
        return apiFetch<StorageObjectLink>("/api/v1/storage/links", { method: "POST", body: request });
    }
    updateLinkDocumentType(linkId: string, documentType: string): Promise<StorageObjectLink> {
        return apiFetch<StorageObjectLink>(`/api/v1/storage/links/${linkId}`, {
            method: "PATCH",
            body: { documentType },
        });
    }
}

export const storageService = new StorageService();
