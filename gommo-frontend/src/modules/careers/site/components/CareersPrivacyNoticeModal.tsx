"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";

type CareersPrivacyNoticeModalProps = {
    open: boolean;
    notice: string;
    version: string;
    onClose: () => void;
};

export function CareersPrivacyNoticeModal({ open, notice, version, onClose }: CareersPrivacyNoticeModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

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
    }, [open, mounted]);

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={(event) => {
                event.stopPropagation();
                onClose();
            }}
        >
            <div className="modal-box flex max-h-[85vh] w-[min(94vw,40rem)] flex-col overflow-hidden p-0">
                <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-5 py-3">
                    <div>
                        <h2 className="text-base font-semibold text-base-content">Aviso de privacidade</h2>
                        <p className="text-xs text-base-content/50">Versão {version}</p>
                    </div>
                    <button
                        type="button"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <MarkdownContent value={notice} />
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
