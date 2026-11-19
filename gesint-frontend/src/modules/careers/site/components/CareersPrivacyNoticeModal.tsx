"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";
import { ModalHeader } from "@/shared/components/ui/ModalHeader";

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
                <ModalHeader title="Aviso de privacidade" subtitle={`Versão ${version}`} onClose={onClose} />
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
