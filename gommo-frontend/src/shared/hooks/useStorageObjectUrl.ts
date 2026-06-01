"use client";

import { useEffect, useState } from "react";
import { storageService } from "@/modules/storage/services/storage.service";

/**
 * Resolve URL autenticada (blob) para exibir imagens do storage fake AWS.
 */
export function useStorageObjectUrl(objectId?: string | null): string | null {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!objectId) {
            setUrl(null);
            return;
        }

        let active = true;
        let blobUrl: string | null = null;

        storageService
            .fetchBlobUrl(objectId)
            .then((resolved) => {
                if (!active) {
                    URL.revokeObjectURL(resolved);
                    return;
                }
                blobUrl = resolved;
                setUrl(resolved);
            })
            .catch(() => {
                if (active) setUrl(null);
            });

        return () => {
            active = false;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [objectId]);

    return url;
}
