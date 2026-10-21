"use client";

import clsx from "clsx";
import {Sparkles} from "lucide-react";

type HeaderAiAssistantProps = {
    open?: boolean;
    onClick?: () => void;
};

/** Botao pill do assistente de IA no header. */
export function HeaderAiAssistant({open = false, onClick}: HeaderAiAssistantProps) {
    return (
        <button
            type="button"
            aria-label="Assistente IA"
            aria-expanded={open}
            aria-controls="ai-assistant-panel"
            onClick={onClick}
            className={clsx(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
                open
                    ? "bg-primary/12 text-primary"
                    : "bg-base-200 text-base-content/80 hover:bg-base-300/80 dark:bg-base-300/50 dark:hover:bg-base-300/70",
            )}
        >
            <Sparkles className={clsx("size-3.5", open ? "text-primary" : "text-primary")} strokeWidth={2}/>
            <span className="hidden sm:inline">Assistente IA</span>
        </button>
    );
}
