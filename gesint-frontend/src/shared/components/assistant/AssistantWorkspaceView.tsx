"use client";

import {CheckSquare, Sparkles, X} from "lucide-react";
import {useEffect, useRef} from "react";
import clsx from "clsx";

import {AssistantEmptyState} from "@/shared/components/assistant/AssistantEmptyState";
import {AssistantHistoryList} from "@/shared/components/assistant/AssistantHistoryList";
import {AssistantTranscript} from "@/shared/components/assistant/AssistantTranscript";
import {useAssistantChat} from "@/shared/components/assistant/assistant-chat";

type AssistantWorkspaceViewProps = {
    onClose?: () => void;
    onOpenLink?: () => void;
};

/** Layout amplo: histórico à esquerda e conversa no centro, como uma sessão nova do GPT. */
export function AssistantWorkspaceView({onClose, onOpenLink}: AssistantWorkspaceViewProps) {
    const {activeConversation, newSession, selectionMode, toggleSelectionMode, clearSelection} = useAssistantChat();
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
        return () => window.clearTimeout(timer);
    }, [activeConversation?.id, newSession]);

    return (
        <div className="flex h-full min-h-0 bg-base-100">
            <aside
                className="flex w-[16.5rem] shrink-0 flex-col border-r bg-base-100"
                style={{borderColor: "var(--sidebar-border)"}}
            >
                <div
                    className="flex h-12 shrink-0 items-center gap-2 border-b px-3"
                    style={{borderColor: "var(--sidebar-border)"}}
                >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="size-3.5" strokeWidth={2}/>
                    </span>
                    <p className="truncate text-[13px] font-semibold text-base-content">Assistente IA</p>
                </div>
                <AssistantHistoryList/>
            </aside>
            <section className="flex min-w-0 flex-1 flex-col">
                <header
                    className="flex h-12 shrink-0 items-center gap-2 border-b px-4"
                    style={{borderColor: "var(--sidebar-border)"}}
                >
                    <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-base-content">
                        {newSession ? "Nova conversa" : activeConversation?.title ?? "Assistente IA"}
                    </p>
                    {!newSession ? (
                        <button
                            type="button"
                            aria-label={selectionMode ? "Cancelar seleção" : "Selecionar mensagens"}
                            aria-pressed={selectionMode}
                            title={selectionMode ? "Cancelar seleção" : "Selecionar mensagens"}
                            onClick={toggleSelectionMode}
                            className={clsx(
                                "gesint-btn gesint-btn--ghost gesint-btn--icon-only",
                                selectionMode ? "bg-primary/10 text-primary" : "text-base-content/50",
                            )}
                        >
                            <CheckSquare className="size-4" strokeWidth={2}/>
                        </button>
                    ) : null}
                    {onClose ? (
                        <button
                            type="button"
                            aria-label="Fechar"
                            onClick={() => {
                                clearSelection();
                                onClose();
                            }}
                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                        >
                            <X className="size-4" strokeWidth={2}/>
                        </button>
                    ) : null}
                </header>
                {newSession && !selectionMode ? (
                    <AssistantEmptyState inputRef={inputRef} spacious/>
                ) : (
                    <AssistantTranscript listRef={listRef} inputRef={inputRef} onOpenLink={onOpenLink}/>
                )}
            </section>
        </div>
    );
}
