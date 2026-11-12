export type DataImportEntityType = "DEPARTMENT" | "JOB_POSITION" | "ADMISSION";

export type DataImportMode = "INSERT" | "UPDATE";

export type DataImportJobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type DataImportRowError = {
    rowNumber: number;
    matchKey?: string | null;
    message: string;
    rowSnapshot?: string | null;
};

export type DataImportJob = {
    id: string;
    code: number;
    entityType: DataImportEntityType;
    importMode: DataImportMode;
    jobStatus: DataImportJobStatus;
    sourceFileName?: string | null;
    totalRows: number;
    processedRows: number;
    successCount: number;
    errorCount: number;
    startedAt?: string | null;
    finishedAt?: string | null;
    errors: DataImportRowError[];
};

export type DataImportActiveLock = {
    entityType: DataImportEntityType;
    importMode: DataImportMode;
    jobId: string;
    processedRows: number;
    totalRows: number;
};
