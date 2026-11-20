"use client";

import clsx from "clsx";
import {Sparkles} from "lucide-react";

type HeaderAiAssistantProps = {
    open?: boolean;
    onClick?: () => void;
};

/**
 * Ação do assistente na trilha de ícones da topbar — mesmo peso visual
 * dos demais botões 24×24 (ClickUp); o rótulo fica no `title`/`aria-label`.
 */
export function HeaderAiAssistant({open = false, onClick}: HeaderAiAssistantProps) {
    return (
        <button
            type="button"
            aria-label="Assistente IA"
            title="Assistente IA"
            aria-expanded={open}
            aria-controls="ai-assistant-panel"
            onClick={onClick}
            className={clsx(
                "gesint-btn gesint-btn--ghost gesint-btn--icon-only",
                open ? "bg-primary/12 text-primary" : "text-base-content/55",
            )}
        >
            <Sparkles className={clsx("size-4", open ? "text-primary" : "text-primary/90")} strokeWidth={2} />
        </button>
    );
}
