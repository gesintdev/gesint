"use client";

import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";
import { Modal } from "@/shared/components/ui/Modal";

type CareersPrivacyNoticeModalProps = {
    open: boolean;
    notice: string;
    version: string;
    onClose: () => void;
};

export function CareersPrivacyNoticeModal({ open, notice, version, onClose }: CareersPrivacyNoticeModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Aviso de privacidade"
            subtitle={`Versão ${version}`}
            layoutClassName="max-h-[85vh] w-[min(94vw,40rem)]"
        >
            <MarkdownContent value={notice} />
        </Modal>
    );
}
