"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {dataImportKeys} from "@/modules/cfg/settings/dataimport/data-import.query";
import type {
    DataImportEntityType,
    DataImportJob,
    DataImportMode,
} from "@/modules/cfg/settings/dataimport/dto/data-import.dto";
import {DATA_IMPORT_CLIENT_MESSAGES} from "@/modules/cfg/settings/dataimport/exceptions/data-import.messages";
import {dataImportService} from "@/modules/cfg/settings/dataimport/services/data-import.service";
import {ExceptionCapture} from "@/shared/exceptions";

const STORAGE_PREFIX = "gesint-data-import-job:";

function storageKey(entityType: DataImportEntityType, mode: DataImportMode) {
    return `${STORAGE_PREFIX}${entityType}:${mode}`;
}

function readStoredJobId(entityType: DataImportEntityType, mode: DataImportMode): string | null {
    if (typeof window === "undefined") return null;
    try {
        return sessionStorage.getItem(storageKey(entityType, mode));
    } catch {
        return null;
    }
}

function writeStoredJobId(entityType: DataImportEntityType, mode: DataImportMode, jobId: string | null) {
    if (typeof window === "undefined") return;
    try {
        const key = storageKey(entityType, mode);
        if (!jobId) {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, jobId);
        }
    } catch {
        // ignore storage failures
    }
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function isActiveStatus(status: DataImportJob["jobStatus"] | undefined): boolean {
    return status === "PENDING" || status === "RUNNING";
}

function isTerminalStatus(status: DataImportJob["jobStatus"] | undefined): boolean {
    return status === "COMPLETED" || status === "FAILED";
}

export function useDataImportJob(entityType: DataImportEntityType, mode: DataImportMode) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const notifiedTerminalJobIdRef = useRef<string | null>(null);
    const [trackedJobId, setTrackedJobId] = useState<string | null>(() => readStoredJobId(entityType, mode));

    const activeQuery = useQuery({
        queryKey: dataImportKeys.active,
        queryFn: () => dataImportService.getActive(),
        // Só faz poll enquanto houver job ativo; evita refetch contínuo na tela.
        refetchInterval: (current) => {
            const jobs = current.state.data ?? [];
            return jobs.some((job) => isActiveStatus(job.jobStatus)) ? 2000 : false;
        },
    });

    useEffect(() => {
        const active = (activeQuery.data ?? []).find(
            (job) => job.entityType === entityType && job.importMode === mode,
        );
        if (active) {
            setTrackedJobId(active.id);
            writeStoredJobId(entityType, mode, active.id);
        }
    }, [activeQuery.data, entityType, mode]);

    const jobQuery = useQuery({
        queryKey: trackedJobId ? dataImportKeys.detail(trackedJobId) : ["data-import", "detail", "none"],
        queryFn: () => dataImportService.getById(trackedJobId as string),
        enabled: Boolean(trackedJobId),
        refetchInterval: (current) => (isActiveStatus(current.state.data?.jobStatus) ? 800 : false),
    });

    // Invalida locks/active uma única vez por job ao terminar — não a cada mudança de referência do data.
    useEffect(() => {
        const job = jobQuery.data;
        if (!job || !isTerminalStatus(job.jobStatus)) {
            return;
        }
        if (notifiedTerminalJobIdRef.current === job.id) {
            return;
        }
        notifiedTerminalJobIdRef.current = job.id;
        void queryClient.invalidateQueries({queryKey: dataImportKeys.locks});
        void queryClient.invalidateQueries({queryKey: dataImportKeys.active});
    }, [jobQuery.data, queryClient]);

    const uploadMutation = useMutation({
        mutationFn: (file: File) => dataImportService.upload(entityType, mode, file),
        onSuccess: (job) => {
            notifiedTerminalJobIdRef.current = null;
            setTrackedJobId(job.id);
            writeStoredJobId(entityType, mode, job.id);
            void queryClient.invalidateQueries({queryKey: dataImportKeys.active});
            void queryClient.invalidateQueries({queryKey: dataImportKeys.locks});
            toast.success("Importação iniciada");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: DATA_IMPORT_CLIENT_MESSAGES.UPLOAD_FAILED}),
    });

    const templateMutation = useMutation({
        mutationFn: () => dataImportService.downloadTemplate(entityType, mode),
        onSuccess: (blob) => {
            downloadBlob(
                blob,
                `modelo_${entityType.toLowerCase()}_${mode.toLowerCase()}.xlsx`,
            );
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: DATA_IMPORT_CLIENT_MESSAGES.TEMPLATE_FAILED}),
    });

    const job: DataImportJob | null = jobQuery.data ?? null;
    const running = isActiveStatus(job?.jobStatus);
    const progressPercent = useMemo(() => {
        if (!job || !job.totalRows) return 0;
        return Math.min(100, Math.round((job.processedRows / job.totalRows) * 100));
    }, [job]);

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        uploadMutation.mutate(file);
    };

    const clearFinished = () => {
        if (job && isTerminalStatus(job.jobStatus)) {
            notifiedTerminalJobIdRef.current = job.id;
            setTrackedJobId(null);
            writeStoredJobId(entityType, mode, null);
        }
    };

    return {
        job,
        running,
        progressPercent,
        fileInputRef,
        uploadMutation,
        templateMutation,
        handleUploadClick,
        handleFileChange,
        clearFinished,
    };
}
