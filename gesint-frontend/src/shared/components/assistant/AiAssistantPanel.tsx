"use client";

import clsx from "clsx";
import {AppWindow, CheckSquare, History, MessageSquarePlus, PanelTop, Sparkles, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {useAssistantChat} from "@/shared/components/assistant/assistant-chat";
import {AssistantChatModal} from "@/shared/components/assistant/AssistantChatModal";
import {AssistantEmptyState} from "@/shared/components/assistant/AssistantEmptyState";
import {AssistantHistoryList} from "@/shared/components/assistant/AssistantHistoryList";
import {AssistantTranscript} from "@/shared/components/assistant/AssistantTranscript";

type AiAssistantPanelProps = {
    sideOpen: boolean;
    modalOpen: boolean;
    onSideClose: () => void;
    onModalClose: () => void;
    onOpenModal: () => void;
    onOpenTab: () => void;
};

export function AiAssistantPanel({
    sideOpen,
    modalOpen,
    onSideClose,
    onModalClose,
    onOpenModal,
    onOpenTab,
}: AiAssistantPanelProps) {
    const {
        activeId,
        activeConversation,
        newSession,
        chatFocusToken,
        selectionMode,
        selectedCount,
        toggleSelectionMode,
        clearSelection,
        startNewConversation,
    } = useAssistantChat();
    const [showHistory, setShowHistory] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historySearchRef = useRef<HTMLInputElement>(null);
    const [shellMounted, setShellMounted] = useState(false);
    const [panelEntered, setPanelEntered] = useState(false);
    const openRef = useRef(sideOpen);

    useEffect(() => {
        openRef.current = sideOpen;
        if (!sideOpen) {
            setPanelEntered(false);
            return;
        }
        setShellMounted(true);
        let cancelled = false;
        const frame = window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (!cancelled && openRef.current) setPanelEntered(true);
            });
        });
        return () => {
            cancelled = true;
            window.cancelAnimationFrame(frame);
        };
    }, [sideOpen]);

    useEffect(() => {
        if (!sideOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            if (selectionMode) {
                clearSelection();
                return;
            }
            onSideClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [sideOpen, onSideClose, selectionMode, clearSelection]);

    useEffect(() => {
        if (chatFocusToken === 0) return;
        setShowHistory(false);
    }, [chatFocusToken]);

    useEffect(() => {
        if (!sideOpen || showHistory || modalOpen) return;
        const timer = window.setTimeout(() => {
            if (openRef.current) inputRef.current?.focus();
        }, 240);
        return () => window.clearTimeout(timer);
    }, [sideOpen, showHistory, activeId, modalOpen, newSession, chatFocusToken]);

    useEffect(() => {
        if (!sideOpen || !showHistory) return;
        const timer = window.setTimeout(() => {
            if (openRef.current) historySearchRef.current?.focus();
        }, 240);
        return () => window.clearTimeout(timer);
    }, [sideOpen, showHistory]);

    const openInModal = () => {
        setShowHistory(false);
        clearSelection();
        onOpenModal();
    };

    const openInTab = () => {
        setShowHistory(false);
        clearSelection();
        onOpenTab();
    };

    if (!shellMounted && !modalOpen) return null;

    const subtitle = showHistory
        ? "Histórico de conversas"
        : selectionMode
          ? selectedCount > 0
              ? `${selectedCount} selecionada${selectedCount === 1 ? "" : "s"}`
              : "Selecione mensagens"
          : newSession
            ? "Nova conversa"
            : activeConversation?.title ?? "Chat de atendimento";

    return (
        <>
            <AssistantChatModal open={modalOpen} onClose={onModalClose}/>
            {shellMounted ? (
                <>
                    <button
                        type="button"
                        aria-label="Fechar assistente"
                        tabIndex={panelEntered ? 0 : -1}
                        className={clsx(
                            "fixed inset-x-0 bottom-0 z-40 bg-base-content/15 transition-opacity duration-200 ease-out lg:bg-base-content/10",
                            panelEntered ? "opacity-100" : "pointer-events-none opacity-0",
                        )}
                        style={{top: "var(--header-height)"}}
                        onClick={onSideClose}
                    />
                    <aside
                        id="ai-assistant-panel"
                        role="dialog"
                        aria-modal={panelEntered}
                        aria-label="Assistente IA"
                        aria-hidden={!panelEntered}
                        {...(!panelEntered ? {inert: true} : {})}
                        className={clsx(
                            "fixed right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l bg-base-100 shadow-xl",
                            "transform-gpu transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                            panelEntered ? "translate-x-0" : "pointer-events-none translate-x-full",
                        )}
                        style={{
                            top: "var(--header-height)",
                            borderColor: "var(--sidebar-border)",
                        }}
                    >
                        <header
                            className="flex h-12 shrink-0 items-center gap-1 border-b px-3 sm:px-4"
                            style={{borderColor: "var(--sidebar-border)"}}
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Sparkles className="size-4" strokeWidth={2}/>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-base-content">Assistente IA</p>
                                <p className="truncate text-[11px] text-base-content/45">{subtitle}</p>
                            </div>
                            {!showHistory && !newSession ? (
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
                            <button
                                type="button"
                                aria-label="Abrir em modal"
                                title="Abrir em modal"
                                onClick={openInModal}
                                className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                            >
                                <AppWindow className="size-4" strokeWidth={2}/>
                            </button>
                            <button
                                type="button"
                                aria-label="Abrir em aba"
                                title="Abrir em aba"
                                onClick={openInTab}
                                className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                            >
                                <PanelTop className="size-4" strokeWidth={2}/>
                            </button>
                            <button
                                type="button"
                                aria-label="Nova conversa"
                                title="Nova conversa"
                                onClick={() => {
                                    startNewConversation();
                                    setShowHistory(false);
                                }}
                                className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                            >
                                <MessageSquarePlus className="size-4" strokeWidth={2}/>
                            </button>
                            <button
                                type="button"
                                aria-label={showHistory ? "Voltar ao chat" : "Histórico"}
                                aria-pressed={showHistory}
                                title={showHistory ? "Voltar ao chat" : "Histórico"}
                                onClick={() => {
                                    setShowHistory((value) => !value);
                                    clearSelection();
                                }}
                                className={clsx(
                                    "gesint-btn gesint-btn--ghost gesint-btn--icon-only",
                                    showHistory ? "bg-primary/10 text-primary" : "text-base-content/50",
                                )}
                            >
                                <History className="size-4" strokeWidth={2}/>
                            </button>
                            <button
                                type="button"
                                aria-label="Fechar"
                                onClick={onSideClose}
                                className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                            >
                                <X className="size-4" strokeWidth={2}/>
                            </button>
                        </header>

                        {showHistory ? (
                            <AssistantHistoryList
                                searchRef={historySearchRef}
                                compact
                                onPicked={() => setShowHistory(false)}
                            />
                        ) : newSession && !selectionMode ? (
                            <AssistantEmptyState inputRef={inputRef}/>
                        ) : (
                            <AssistantTranscript listRef={listRef} inputRef={inputRef} onOpenLink={onSideClose}/>
                        )}
                    </aside>
                </>
            ) : null}
        </>
    );
}
