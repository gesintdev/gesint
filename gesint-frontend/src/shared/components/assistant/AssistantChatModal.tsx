"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {AssistantWorkspaceView} from "@/shared/components/assistant/AssistantWorkspaceView";

type AssistantChatModalProps = {
    open: boolean;
    onClose: () => void;
};

export function AssistantChatModal({open, onClose}: AssistantChatModalProps) {
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
    }, [open]);

    if (!mounted) return null;

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex h-[92dvh] max-h-[92dvh] w-[min(100vw-1rem,72rem)] max-w-6xl flex-col overflow-hidden p-0 sm:h-[92vh] sm:max-h-[92vh]">
                <AssistantWorkspaceView onClose={onClose} onOpenLink={onClose}/>
            </div>
        </dialog>,
        document.body,
    );
}
