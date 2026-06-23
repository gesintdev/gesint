import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Download, Pencil, Trash2, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { documentTypeLabel } from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import type { StorageObjectLink } from "@/modules/storage/dto/storage.dto";
import { formatStorageMaxFileSize, isStorageFileTooLarge } from "@/modules/storage/lib/storage-limits";
import { storageService } from "@/modules/storage/services/storage.service";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { InputSelect } from "@/shared/components/ui/input/InputSelect";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { sortRowsByCreatedAtDesc } from "@/shared/lib/table/sort-rows-by-created-at";
import { SystemAlert } from "@/shared/system-alert";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export type PendingAttachment = {
    id: string;
    file: File;
    displayName: string;
    documentType?: string;
};

type AttachmentTableRow = {
    id: string;
    displayName: string;
    documentTypeLabel?: string;
    sizeLabel: string;
    statusLabel?: string;
    pending: boolean;
    serverLink?: StorageObjectLink;
    pendingItem?: PendingAttachment;
    createdAt?: string;
};

type EntityAttachmentsProps = {
    entityType: string;
    entityId: string | null;
    linkRole?: string;
    documentTypeItems?: SelectItem[];
    emptyMessage?: string;
    /** Mantém arquivos locais até o formulário pai persistir a entidade. */
    deferUpload?: boolean;
    pendingAttachments?: PendingAttachment[];
    onPendingAttachmentsChange?: (attachments: PendingAttachment[]) => void;
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createPendingId(): string {
    return crypto.randomUUID();
}

export async function flushPendingAttachments(params: {
    entityType: string;
    entityId: string;
    linkRole: string;
    items: PendingAttachment[];
}): Promise<void> {
    for (const item of params.items) {
        const object = await storageService.upload(item.file);
        await storageService.linkObject({
            objectId: object.id,
            entityType: params.entityType,
            entityId: params.entityId,
            linkRole: params.linkRole,
            displayName: item.displayName,
            documentType: item.documentType,
        });
    }
}

export function EntityAttachments({
    entityType,
    entityId,
    linkRole = "DOCUMENT",
    documentTypeItems,
    emptyMessage = "Nenhum documento anexado.",
    deferUpload = false,
    pendingAttachments = [],
    onPendingAttachmentsChange,
}: EntityAttachmentsProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [documentType, setDocumentType] = useState("");
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editingDocumentType, setEditingDocumentType] = useState("");
    const queryKey = ["storage-links", entityType, entityId] as const;
    const linksQuery = useQuery({
        queryKey,
        queryFn: () => storageService.listLinks(entityType, entityId!),
        enabled: Boolean(entityId) && !deferUpload,
    });
    const serverLinksQuery = useQuery({
        queryKey,
        queryFn: () => storageService.listLinks(entityType, entityId!),
        enabled: Boolean(entityId) && deferUpload,
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
    const updateDocumentTypeMutation = useMutation({
        mutationFn: async ({ linkId, documentType: nextType }: { linkId: string; documentType: string }) =>
            storageService.updateLinkDocumentType(linkId, nextType),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey });
            setEditingRowId(null);
            setEditingDocumentType("");
            toast.success("Tipo de documento atualizado");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível atualizar o tipo de documento" }),
    });
    const handleDownload = async (row: AttachmentTableRow) => {
        if (row.pending && row.pendingItem) {
            const url = URL.createObjectURL(row.pendingItem.file);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = row.pendingItem.displayName;
            anchor.rel = "noopener";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
            return;
        }

        if (!row.serverLink) return;
        setDownloadingId(row.id);
        try {
            await storageService.downloadFile(row.serverLink.storageObjectId, row.displayName);
        } catch (err: unknown) {
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível baixar o arquivo" });
        } finally {
            setDownloadingId(null);
        }
    };
    const startEditDocumentType = (row: AttachmentTableRow) => {
        const currentType = row.pending ? (row.pendingItem?.documentType ?? "") : (row.serverLink?.documentType ?? "");
        setEditingRowId(row.id);
        setEditingDocumentType(currentType);
    };
    const cancelEditDocumentType = () => {
        setEditingRowId(null);
        setEditingDocumentType("");
    };
    const saveEditDocumentType = (row: AttachmentTableRow) => {
        if (!editingDocumentType) {
            toast.error("Selecione o tipo de documento.");
            return;
        }

        if (row.pending && row.pendingItem && onPendingAttachmentsChange) {
            onPendingAttachmentsChange(
                pendingAttachments.map((item) =>
                    item.id === row.id ? { ...item, documentType: editingDocumentType } : item,
                ),
            );
            cancelEditDocumentType();
            toast.success("Tipo de documento atualizado");
            return;
        }

        if (row.serverLink) {
            updateDocumentTypeMutation.mutate({
                linkId: row.serverLink.id,
                documentType: editingDocumentType,
            });
        }
    };
    const addPendingAttachment = (file: File) => {
        if (!onPendingAttachmentsChange) return;
        const next: PendingAttachment = {
            id: createPendingId(),
            file,
            displayName: file.name,
            documentType: documentType || undefined,
        };
        onPendingAttachmentsChange([...pendingAttachments, next]);
        setDocumentType("");
        toast.success("Arquivo anexado");
    };
    const removePendingAttachment = (id: string) => {
        if (!onPendingAttachmentsChange) return;
        onPendingAttachmentsChange(pendingAttachments.filter((item) => item.id !== id));
        toast.success("Anexo removido");
    };
    const handleImmediateUpload = async (file: File) => {
        if (!entityId) return;
        if (documentTypeItems?.length && !documentType) {
            toast.error("Selecione o tipo de documento antes de enviar.");
            return;
        }
        setUploading(true);
        try {
            const object = await storageService.upload(file);
            await storageService.linkObject({
                objectId: object.id,
                entityType,
                entityId,
                linkRole,
                displayName: file.name,
                documentType: documentType || undefined,
            });
            await queryClient.invalidateQueries({ queryKey });
            setDocumentType("");
            toast.success("Arquivo enviado");
        } catch (err: unknown) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha no upload" });
        } finally {
            setUploading(false);
        }
    };
    const handleFileSelected = (file: File) => {
        if (isStorageFileTooLarge(file.size)) {
            toast.error(`Arquivo excede o tamanho máximo de ${formatStorageMaxFileSize()}.`);
            return;
        }

        if (documentTypeItems?.length && !documentType) {
            toast.error("Selecione o tipo de documento antes de anexar.");
            return;
        }

        if (deferUpload) {
            addPendingAttachment(file);
            return;
        }
        void handleImmediateUpload(file);
    };
    const columns: TableColumnConfig[] = [
        ...(documentTypeItems
            ? [
                  {
                      id: "documentType",
                      columnName: "Tipo",
                      fieldValue: "documentTypeLabel",
                      dataType: TableDataType.TEXT,
                  },
              ]
            : []),
        { id: "displayName", columnName: "Arquivo", fieldValue: "displayName", dataType: TableDataType.TEXT },
        { id: "size", columnName: "Tamanho", fieldValue: "sizeLabel", dataType: TableDataType.TEXT },
        ...(deferUpload
            ? [{ id: "status", columnName: "Situação", fieldValue: "statusLabel", dataType: TableDataType.TEXT }]
            : []),
    ];
    const rows = useMemo(() => {
        const activeLinks = deferUpload ? (serverLinksQuery.data ?? []) : (linksQuery.data ?? []);
        const serverRows: AttachmentTableRow[] = sortRowsByCreatedAtDesc(
            activeLinks
                .filter((link) => (link.linkRole ?? "DOCUMENT") === linkRole)
                .map((link) => ({
                    id: link.id,
                    displayName: link.displayName ?? link.storageObject?.objectKey ?? "Arquivo",
                    documentTypeLabel: documentTypeLabel(link.documentType, documentTypeItems),
                    sizeLabel:
                        link.storageObject?.contentLength != null
                            ? formatFileSize(link.storageObject.contentLength)
                            : "—",
                    pending: false,
                    serverLink: link,
                    createdAt: link.createdAt,
                    statusLabel: "Salvo",
                })),
        );
        const pendingRows: AttachmentTableRow[] = pendingAttachments.map((item) => ({
            id: item.id,
            displayName: item.displayName,
            documentTypeLabel: documentTypeLabel(item.documentType, documentTypeItems),
            sizeLabel: formatFileSize(item.file.size),
            pending: true,
            pendingItem: item,
            statusLabel: "Pendente",
        }));
        return [...pendingRows, ...serverRows];
    }, [deferUpload, documentTypeItems, linkRole, linksQuery.data, pendingAttachments, serverLinksQuery.data]);

    if (!deferUpload && !entityId) {
        return <p className="text-sm text-base-content/50">Salve o registro para anexar documentos.</p>;
    }

    const isLoading = deferUpload ? serverLinksQuery.isLoading : linksQuery.isLoading;

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-end gap-4">
                {documentTypeItems ? (
                    <InputSelect
                        label="Tipo de documento"
                        items={documentTypeItems}
                        value={documentType}
                        onValueChange={setDocumentType}
                        placeholder="Selecione o tipo"
                        wrapperClassName="min-w-[14rem] flex-1"
                        required
                    />
                ) : null}
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelected(file);
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
                    {deferUpload ? "Anexar arquivo" : "Enviar arquivo"}
                </Button>
            </div>
            {deferUpload ? (
                <p className="text-xs text-base-content/45">Os arquivos serão enviados ao salvar o cadastro.</p>
            ) : null}
            {isLoading ? (
                <div className="skeleton-shimmer h-24 w-full rounded-lg" />
            ) : (
                <DataTable<AttachmentTableRow>
                    data={rows}
                    columns={columns}
                    rowKey="id"
                    emptyMessage={emptyMessage}
                    renderActions={(row) => (
                        <div className="flex flex-wrap items-center justify-end gap-1">
                            {documentTypeItems && editingRowId === row.id ? (
                                <>
                                    <InputSelect
                                        items={documentTypeItems}
                                        value={editingDocumentType}
                                        onValueChange={setEditingDocumentType}
                                        placeholder="Tipo"
                                        wrapperClassName="min-w-[11rem]"
                                    />
                                    <TableActionButton
                                        actionVariant="edit"
                                        aria-label="Confirmar tipo"
                                        leftIcon={<Check className="size-3.5" />}
                                        loading={updateDocumentTypeMutation.isPending}
                                        onClick={() => saveEditDocumentType(row)}
                                    />
                                    <TableActionButton
                                        actionVariant="delete"
                                        aria-label="Cancelar edição"
                                        leftIcon={<X className="size-3.5" />}
                                        onClick={cancelEditDocumentType}
                                    />
                                </>
                            ) : (
                                <>
                                    {documentTypeItems ? (
                                        <TableActionButton
                                            actionVariant="edit"
                                            aria-label="Editar tipo de documento"
                                            leftIcon={<Pencil className="size-3.5" />}
                                            onClick={() => startEditDocumentType(row)}
                                        />
                                    ) : null}
                                    <TableActionButton
                                        actionVariant="download"
                                        aria-label="Download"
                                        leftIcon={<Download className="size-3.5" />}
                                        loading={downloadingId === row.id}
                                        onClick={() => void handleDownload(row)}
                                    />
                                    <TableActionButton
                                        actionVariant="delete"
                                        aria-label="Excluir"
                                        leftIcon={<Trash2 className="size-3.5" />}
                                        loading={!row.pending && deleteMutation.isPending}
                                        onClick={async () => {
                                            if (row.pending) {
                                                removePendingAttachment(row.id);
                                                return;
                                            }

                                            if (!(await SystemAlert.confirmDelete("Deseja remover este arquivo?")))
                                                return;
                                            deleteMutation.mutate(row.serverLink!);
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    )}
                />
            )}
        </div>
    );
}
