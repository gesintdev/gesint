"use client";

import { useEffect, useState } from "react";

import { storageService } from "@/modules/storage/services/storage.service";
import { Modal } from "@/shared/components/ui/Modal";
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
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title || "Visualizar PDF"}
            subtitle="Pré-visualização"
            layoutClassName="h-[96vh] max-h-[96vh] w-[min(96vw,90rem)] max-w-[96vw]"
            padded={false}
            scroll={false}
            bodyClassName="flex min-h-0 flex-col overflow-hidden"
        >
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
        </Modal>
    );
}
