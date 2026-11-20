"use client";

import clsx from "clsx";
import {MessageSquarePlus, Search, Trash2, X} from "lucide-react";
import {type Ref} from "react";

import {formatConversationDate, useAssistantChat} from "@/shared/components/assistant/assistant-chat";

type AssistantHistoryListProps = {
    searchRef?: Ref<HTMLInputElement>;
    compact?: boolean;
    /** Painel estreito: ao escolher ou criar, volta para a conversa. */
    onPicked?: () => void;
};

export function AssistantHistoryList({searchRef, compact = false, onPicked}: AssistantHistoryListProps) {
    const {
        activeId,
        historyQuery,
        setHistoryQuery,
        filteredConversations,
        startNewConversation,
        openConversation,
        deleteConversation,
    } = useAssistantChat();

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b px-3 py-2.5" style={{borderColor: "var(--sidebar-border)"}}>
                <button
                    type="button"
                    onClick={() => {
                        startNewConversation();
                        onPicked?.();
                    }}
                    className="mb-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-base-content/10 bg-base-100 text-[13px] font-medium text-base-content transition-colors hover:bg-base-content/4"
                >
                    <MessageSquarePlus className="size-3.5" strokeWidth={2}/>
                    Nova conversa
                </button>
                <label className="flex h-9 items-center gap-2 rounded-xl border border-base-content/10 bg-base-200/60 px-2.5">
                    <Search className="size-3.5 shrink-0 text-base-content/40" strokeWidth={2} aria-hidden/>
                    <input
                        ref={searchRef}
                        type="search"
                        value={historyQuery}
                        placeholder="Pesquisar conversas"
                        aria-label="Pesquisar conversas"
                        className="h-full min-w-0 flex-1 bg-transparent text-[13px] leading-none text-base-content outline-none placeholder:text-base-content/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                        onChange={(event) => setHistoryQuery(event.target.value)}
                    />
                    <button
                        type="button"
                        aria-label="Limpar pesquisa"
                        title="Limpar pesquisa"
                        disabled={!historyQuery}
                        onClick={() => setHistoryQuery("")}
                        className={clsx(
                            "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-base-content/40 transition",
                            historyQuery
                                ? "hover:bg-base-content/8 hover:text-base-content"
                                : "invisible pointer-events-none",
                        )}
                    >
                        <X className="size-3.5" strokeWidth={2}/>
                    </button>
                </label>
            </div>
            <div className={clsx("min-h-0 flex-1 overflow-y-auto px-2 py-2", compact ? "" : "sm:px-3")}>
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-base-content/40">
                    Conversas
                    {historyQuery.trim() ? ` · ${filteredConversations.length}` : ""}
                </p>
                {filteredConversations.length === 0 ? (
                    <p className="px-2 py-6 text-center text-[13px] text-base-content/45">
                        {historyQuery.trim() ? "Nenhuma conversa encontrada." : "Nenhuma conversa ainda."}
                    </p>
                ) : (
                    <ul className="grid gap-1">
                        {filteredConversations.map((conversation) => {
                            const active = conversation.id === activeId;
                            return (
                                <li key={conversation.id}>
                                    <div
                                        className={clsx(
                                            "group flex items-start gap-1 rounded-lg px-2 py-2 transition-colors",
                                            active ? "bg-primary/8 text-primary" : "hover:bg-base-content/4",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                openConversation(conversation.id);
                                                onPicked?.();
                                            }}
                                            className="min-w-0 flex-1 text-left"
                                        >
                                            <p
                                                className={clsx(
                                                    "truncate text-[13px] font-medium",
                                                    active ? "text-primary" : "text-base-content",
                                                )}
                                            >
                                                {conversation.title}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-base-content/45">
                                                {formatConversationDate(conversation.updatedAt)}
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Excluir conversa"
                                            title="Excluir conversa"
                                            onClick={() => deleteConversation(conversation.id)}
                                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/40 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <Trash2 className="size-3.5" strokeWidth={2}/>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
