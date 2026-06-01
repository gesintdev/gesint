import type {
    StorageLinkRequest,
    StorageObject,
    StorageObjectLink,
} from "@/modules/storage/dto/storage.dto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        "X-Correlation-ID": crypto.randomUUID(),
        ...extra,
    };
    if (typeof window !== "undefined") {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const token = session?.accessToken;
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

class StorageService {
    async upload(file: File): Promise<StorageObject> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_BASE_URL}/api/v1/storage/upload`, {
            method: "POST",
            headers: await authHeaders(),
            body: formData,
        });
        if (!response.ok) {
            const { AppException } = await import("@/shared/exceptions/app.exception");
            let payload = { code: "STORAGE_UPLOAD_FAILED", message: response.statusText };
            try {
                payload = await response.json();
            } catch {
                /* empty */
            }
            throw AppException.fromApiResponse(payload, response.status);
        }
        return (await response.json()) as StorageObject;
    }

    listLinks(entityType: string, entityId: string): Promise<StorageObjectLink[]> {
        const params = new URLSearchParams({ entityType, entityId });
        return import("@/shared/lib/api.client").then(({ apiFetch }) =>
            apiFetch<StorageObjectLink[]>(`/api/v1/storage/links?${params}`),
        );
    }

    downloadUrl(id: string): string {
        return `${API_BASE_URL}/api/v1/storage/objects/${id}/download`;
    }

    async fetchBlobUrl(id: string): Promise<string> {
        const response = await fetch(this.downloadUrl(id), {
            headers: await authHeaders(),
        });
        if (!response.ok) {
            throw new Error("Falha ao carregar imagem");
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    deleteObject(id: string): Promise<void> {
        return import("@/shared/lib/api.client").then(({ apiFetch }) =>
            apiFetch<void>(`/api/v1/storage/objects/${id}`, { method: "DELETE" }),
        );
    }

    linkObject(request: StorageLinkRequest): Promise<StorageObjectLink> {
        return import("@/shared/lib/api.client").then(({ apiFetch }) =>
            apiFetch<StorageObjectLink>("/api/v1/storage/links", { method: "POST", body: request }),
        );
    }
}

export const storageService = new StorageService();
