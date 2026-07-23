"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { storageService } from "@/modules/storage/services/storage.service";
import { ExceptionCapture } from "@/shared/exceptions";

type StoragePdfPreviewModalProps = {
    open: boolean;
    title: string;
    /** Objeto já persistido no storage. */
    storageObjectId?: string | null;
    /** Arquivo local pendente (ainda não enviado). */
    localFile?: File | null;
    onClose: () => void;
};

export function StoragePdfPreviewModal({
    open,
    title,
    storageObjectId,
    localFile,
    onClose,
}: StoragePdfPreviewModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            setPdfUrl(null);
            setError(null);
            setLoading(false);
            return;
        }

        let active = true;
        let objectUrl: string | null = null;

        const load = async () => {
            setLoading(true);
            setError(null);
            setPdfUrl(null);
            try {
                if (localFile) {
                    objectUrl = URL.createObjectURL(localFile);
                } else if (storageObjectId) {
                    objectUrl = await storageService.fetchBlobUrl(storageObjectId);
                } else {
                    throw new Error("Arquivo indisponível para visualização.");
                }
                if (!active) {
                    URL.revokeObjectURL(objectUrl);
                    return;
                }
                setPdfUrl(objectUrl);
            } catch (err: unknown) {
                if (!active) return;
                setError(
                    ExceptionCapture.displayMessage(err, "Não foi possível abrir o PDF para visualização."),
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        void load();

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [open, storageObjectId, localFile]);

    if (!mounted) return null;

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex h-[96vh] max-h-[96vh] w-[min(96vw,90rem)] max-w-[96vw] flex-col overflow-hidden p-0">
                <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-4 py-3">
                    <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold text-base-content">
                            {title || "Visualizar PDF"}
                        </h4>
                        <p className="text-xs text-base-content/50">Pré-visualização</p>
                    </div>
                    <button
                        type="button"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>
                <div className="min-h-0 flex-1 bg-base-200">
                    {loading ? (
                        <div className="flex h-full min-h-[80vh] items-center justify-center text-sm text-base-content/60">
                            Carregando PDF…
                        </div>
                    ) : null}
                    {!loading && error ? (
                        <div className="flex h-full min-h-[80vh] items-center justify-center px-6 text-center text-sm text-error">
                            {error}
                        </div>
                    ) : null}
                    {!loading && !error && pdfUrl ? (
                        <iframe title={title || "PDF"} src={pdfUrl} className="h-full min-h-[80vh] w-full border-0" />
                    ) : null}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    close
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
