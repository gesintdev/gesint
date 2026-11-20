"use client";

import {AssistantWorkspaceView} from "@/shared/components/assistant/AssistantWorkspaceView";
import {Modal} from "@/shared/components/ui/Modal";

type AssistantChatModalProps = {
    open: boolean;
    onClose: () => void;
};

export function AssistantChatModal({open, onClose}: AssistantChatModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="full"
            padded={false}
            scroll={false}
            bodyClassName="h-full overflow-hidden"
        >
            <AssistantWorkspaceView onClose={onClose} onOpenLink={onClose}/>
        </Modal>
    );
}
