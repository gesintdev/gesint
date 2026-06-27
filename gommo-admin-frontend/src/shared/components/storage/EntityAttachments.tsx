"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import type { StorageObjectLink } from "@/modules/storage/dto/storage.dto";
import { storageService } from "@/modules/storage/services/storage.service";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const ATTACHMENT_COLUMNS: TableColumnConfig[] = [
    { id: "displayName", columnName: "Nome", fieldValue: "displayName", dataType: TableDataType.TEXT },
    { id: "bucket", columnName: "Bucket", fieldValue: "storageObject.bucket", dataType: TableDataType.TEXT },
    { id: "objectKey", columnName: "Chave", fieldValue: "storageObject.objectKey", dataType: TableDataType.TEXT },
    { id: "size", columnName: "Tamanho", fieldValue: "storageObject.contentLength", dataType: TableDataType.TEXT },
    { id: "contentType", columnName: "Tipo", fieldValue: "storageObject.contentType", dataType: TableDataType.TEXT },
    { id: "etag", columnName: "ETag", fieldValue: "storageObject.etag", dataType: TableDataType.TEXT },
];

type EntityAttachmentsProps = {
    entityType: string;
    entityId: string | null;
    linkRole?: string;
};

export function EntityAttachments({ entityType, entityId, linkRole = "DOCUMENT" }: EntityAttachmentsProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const queryKey = ["storage-links", entityType, entityId] as const;
    const linksQuery = useQuery({
        queryKey,
        queryFn: () => storageService.listLinks(entityType, entityId!),
        enabled: Boolean(entityId),
    });
    const deleteMutation = useMutation({
        mutationFn: async (link: StorageObjectLink) => {
            await storageService.deleteObject(link.storageObjectId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey });
            toast.success("Arquivo removido");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível remover o arquivo" }),
    });
    const handleUpload = async (file: File) => {
        if (!entityId) return;
        setUploading(true);
        try {
            const object = await storageService.upload(file);
            await storageService.linkObject({
                objectId: object.id,
                entityType,
                entityId,
                linkRole,
                displayName: file.name,
            });
            await queryClient.invalidateQueries({ queryKey });
            toast.success("Arquivo enviado");
        } catch (err: unknown) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha no upload" });
        } finally {
            setUploading(false);
        }
    };

    if (!entityId) {
        return <p className="text-sm text-base-content/50">Salve o registro para anexar documentos.</p>;
    }

    const rows = linksQuery.data ?? [];

    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(file);
                        e.target.value = "";
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploading}
                    leftIcon={<Upload className="size-3.5" />}
                    onClick={() => inputRef.current?.click()}
                >
                    Enviar arquivo
                </Button>
            </div>
            {linksQuery.isLoading ? (
                <div className="skeleton-shimmer h-24 w-full rounded-lg" />
            ) : (
                <DataTable<StorageObjectLink>
                    data={rows}
                    columns={ATTACHMENT_COLUMNS}
                    rowKey="id"
                    emptyMessage="Nenhum documento anexado."
                    renderActions={(row) => (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Download"
                                leftIcon={<Download className="size-3.5" />}
                                onClick={() => {
                                    const url = storageService.downloadUrl(row.storageObjectId);
                                    window.open(url, "_blank");
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Excluir"
                                className="text-error hover:bg-error/10"
                                leftIcon={<Trash2 className="size-3.5" />}
                                loading={deleteMutation.isPending}
                                onClick={async () => {
                                    if (
                                        !(await SystemAlert.confirmDelete(
                                            "Deseja remover este arquivo? Esta ação não pode ser desfeita.",
                                        ))
                                    )
                                        return;
                                    deleteMutation.mutate(row);
                                }}
                            />
                        </>
                    )}
                />
            )}
        </div>
    );
}
