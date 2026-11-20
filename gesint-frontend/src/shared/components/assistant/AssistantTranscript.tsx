"use client";

import clsx from "clsx";
import {Trash2} from "lucide-react";
import {type Ref, useEffect} from "react";

import {AssistantComposer} from "@/shared/components/assistant/AssistantComposer";
import {useAssistantChat} from "@/shared/components/assistant/assistant-chat";
import {MarkdownContent} from "@/shared/components/ui/MarkdownContent";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";

type AssistantTranscriptProps = {
    listRef?: Ref<HTMLDivElement>;
    inputRef?: Ref<HTMLTextAreaElement>;
    onOpenLink?: () => void;
};

export function AssistantTranscript({listRef, inputRef, onOpenLink}: AssistantTranscriptProps) {
    const {openFromHref} = useWorkspaceNavigation();
    const {
        messages,
        sending,
        selectionMode,
        selectedIds,
        selectedCount,
        allSelectableSelected,
        toggleMessageSelected,
        toggleSelectAllMessages,
        deleteSelectedMessages,
    } = useAssistantChat();

    useEffect(() => {
        const el = typeof listRef === "object" && listRef ? listRef.current : null;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [listRef, messages, sending]);

    return (
        <>
            {selectionMode ? (
                <div
                    className="flex shrink-0 items-center gap-2 border-b px-3 py-2 sm:px-4"
                    style={{borderColor: "var(--sidebar-border)"}}
                >
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-base-content/70">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-primary"
                            checked={allSelectableSelected}
                            onChange={toggleSelectAllMessages}
                            aria-label="Selecionar todas as mensagens"
                        />
                        Todas
                    </label>
                    <div className="min-w-0 flex-1"/>
                    <button
                        type="button"
                        disabled={selectedCount === 0}
                        onClick={deleteSelectedMessages}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-error transition-colors hover:bg-error/10 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <Trash2 className="size-3.5" strokeWidth={2}/>
                        Apagar{selectedCount > 0 ? ` (${selectedCount})` : ""}
                    </button>
                </div>
            ) : null}

            <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
                {messages.map((message) => {
                    const selected = selectedIds.has(message.id);
                    const isUser = message.role === "user";
                    return (
                        <div
                            key={message.id}
                            className={clsx(
                                "flex items-start gap-2",
                                isUser ? "justify-end" : "justify-start",
                                selectionMode ? "ps-0 pe-0" : isUser ? "ml-3 sm:ml-8" : "mr-3 sm:mr-8",
                            )}
                        >
                            {selectionMode ? (
                                <label className="mt-2.5 inline-flex shrink-0 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-primary"
                                        checked={selected}
                                        onChange={() => toggleMessageSelected(message.id)}
                                        aria-label={`Selecionar mensagem ${isUser ? "enviada" : "do assistente"}`}
                                    />
                                </label>
                            ) : null}
                            <div
                                className={clsx(
                                    "min-w-0 max-w-[calc(100%-1.75rem)] px-3 py-2 text-[13px] leading-5",
                                    isUser
                                        ? "rounded-2xl rounded-br-md bg-primary text-primary-content whitespace-pre-wrap"
                                        : "rounded-2xl rounded-bl-md bg-base-200 text-base-content",
                                    selectionMode && selected && "ring-2 ring-primary/35",
                                )}
                                onClick={selectionMode ? () => toggleMessageSelected(message.id) : undefined}
                                role={selectionMode ? "button" : undefined}
                            >
                                {message.role === "assistant" ? (
                                    <>
                                        <MarkdownContent
                                            value={message.content}
                                            className="text-[13px] leading-5 text-base-content [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2"
                                        />
                                        {message.links && message.links.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {message.links.map((link) => (
                                                    <button
                                                        key={`${message.id}-${link.href}`}
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openFromHref(link.href);
                                                            onOpenLink?.();
                                                        }}
                                                        className="inline-flex items-center rounded-lg border border-primary/25 bg-primary/8 px-2.5 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary/14"
                                                    >
                                                        {link.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </>
                                ) : (
                                    message.content
                                )}
                            </div>
                        </div>
                    );
                })}
                {sending ? (
                    <div className="mr-3 flex justify-start sm:mr-8">
                        <div className="rounded-2xl rounded-bl-md bg-base-200 px-3 py-2.5 text-base-content/55">
                            <span className="loading loading-dots loading-sm" aria-label="Pensando"/>
                        </div>
                    </div>
                ) : null}
            </div>

            <footer className="shrink-0 border-t p-3 sm:p-4" style={{borderColor: "var(--sidebar-border)"}}>
                <AssistantComposer inputRef={inputRef}/>
            </footer>
        </>
    );
}
