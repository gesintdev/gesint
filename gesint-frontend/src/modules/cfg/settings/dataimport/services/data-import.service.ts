import type {
    DataImportActiveLock,
    DataImportEntityType,
    DataImportJob,
    DataImportMode,
} from "@/modules/cfg/settings/dataimport/dto/data-import.dto";
import {apiFetch, apiFetchBlob, doRequest} from "@/shared/lib/api.client";

class DataImportService {
    private readonly basePath = "/api/v1/data-imports";

    downloadTemplate(entityType: DataImportEntityType, mode: DataImportMode): Promise<Blob> {
        return apiFetchBlob(`${this.basePath}/template?entityType=${entityType}&mode=${mode}`);
    }

    upload(entityType: DataImportEntityType, mode: DataImportMode, file: File): Promise<DataImportJob> {
        const formData = new FormData();
        formData.append("file", file);
        return doRequest<DataImportJob>(
            `${this.basePath}/upload?entityType=${entityType}&mode=${mode}`,
            {
                method: "POST",
                body: formData,
            },
        );
    }

    getById(jobId: string): Promise<DataImportJob> {
        return apiFetch<DataImportJob>(`${this.basePath}/${jobId}`);
    }

    getActive(): Promise<DataImportJob[]> {
        return apiFetch<DataImportJob[]>(`${this.basePath}/active`);
    }

    getActiveLocks(): Promise<DataImportActiveLock[]> {
        return apiFetch<DataImportActiveLock[]>(`${this.basePath}/active-locks`);
    }
}

export const dataImportService = new DataImportService();
